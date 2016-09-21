import * as Keymaster from 'keymaster';
import {Scene, Mesh, ShaderMaterial, Vector3, ArrowHelper, Raycaster, BoxGeometry, MeshBasicMaterial} from 'three';
import MouseManager from '../lib/MouseManager';

import EntityManager from "../../shared/EntityManager";
import {
    InputComponent, PositionComponent, RotationComponent, TerrainChunkComponent, PhysicsComponent
} from "../../shared/components";
import Server from "./Server";
import {MeshComponent, PlayerComponent, PlayerSelectionComponent} from "./components";
import {buildChunkGeometry} from "./terrain";
import {TERRAIN_CHUNK_SIZE, ComponentId} from "../../shared/constants";
import {System} from "../../shared/systems";
import {findBlockMaterial} from "./helpers";
import {globalToChunk, chunkKey, mod} from "../../shared/helpers";


export class PlayerInputSystem extends System {
    update(dt: number) {
        this.entityManager.getEntities(ComponentId.CurrentPlayer).forEach((component, entity) => {
            // Keyboard
            let input = this.entityManager.getComponent(entity, ComponentId.Input) as InputComponent;

            let moveForward = Keymaster.isPressed('W'.charCodeAt(0));
            let moveLeft = Keymaster.isPressed('A'.charCodeAt(0));
            let moveRight = Keymaster.isPressed('D'.charCodeAt(0));
            let moveBackward = Keymaster.isPressed('S'.charCodeAt(0));
            let jump = Keymaster.isPressed(' '.charCodeAt(0));

            if (moveForward !== input.moveForward) {
                input.moveForward = moveForward;
            }
            if (moveLeft !== input.moveLeft) {
                input.moveLeft = moveLeft;
            }
            if (moveRight !== input.moveRight) {
                input.moveRight = moveRight;
            }
            if (moveBackward !== input.moveBackward) {
                input.moveBackward = moveBackward;
            }
            if (jump !== input.jump) {
                input.jump = jump;
            }

            // Mouse movement
            let rot = this.entityManager.getComponent(entity, ComponentId.Rotation) as RotationComponent;
            let [dx, dy] = MouseManager.delta();
            if (dx !== 0) {
                rot.y -= dx / 5.0 * dt;
            }
            if (dy !== 0) {
                rot.x -= dy / 5.0 * dt;
                if (rot.x < -Math.PI / 2.0) rot.x = -Math.PI / 2.0;
                else if (rot.x > Math.PI / 2.0) rot.x = Math.PI / 2.0;
            }

            // Mouse clicks (and maybe also keypad in the future)
            let actionPrimary = MouseManager.isLeftButtonPressed();
            let actionSecondary = MouseManager.isLeftButtonPressed();
            if ((actionPrimary && !input.primaryAction) || (actionSecondary && !input.secondaryAction)) {
                let selectionComponent = this.entityManager.getComponent(entity, ComponentId.PlayerSelection) as PlayerSelectionComponent;
                input.actionTarget = selectionComponent.target;
            }
            if (actionPrimary !== input.primaryAction) {
                input.primaryAction = actionPrimary;
            }
            if (actionSecondary !== input.secondaryAction) {
                input.secondaryAction = actionSecondary;
            }
        })
    }
}


export class PlayerInputSyncSystem extends System {
    server: Server;

    constructor(em: EntityManager, server: Server) {
        super(em);
        this.server = server;
    }

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.CurrentPlayer).forEach((component, entity) => {
            let position = this.entityManager.getComponent(entity, ComponentId.Position);
            let input = this.entityManager.getComponent(entity, ComponentId.Input);

            if (input.isDirty()) {
                let components = {};
                components[ComponentId.Position] = position;
                components[ComponentId.Input] = input;
                this.server.sendEntity({
                    entity: entity,
                    components: components
                });
            }

            let rot = this.entityManager.getComponent(entity, ComponentId.Rotation) as RotationComponent;
            if (rot.isDirty()) {
                let components = {};
                components[ComponentId.Rotation] = rot;
                this.server.sendEntity({
                    entity: entity,
                    components: components
                });
            }
        })
    }
}

export class PlayerMeshSystem extends System {
    scene: Scene;

    constructor(em: EntityManager, scene: Scene) {
        super(em);
        this.scene = scene;
    }

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.Player).forEach((component, entity) => {
            let playerComponent = component as PlayerComponent;
            let mesh = playerComponent.mesh;

            if (!mesh.parent) {
                this.scene.add(mesh);
            }

            let position = this.entityManager.getComponent(entity, ComponentId.Position) as PositionComponent;
            mesh.position.x = position.x;
            mesh.position.y = position.y;
            mesh.position.z = position.z;

            let rot = this.entityManager.getComponent(entity, ComponentId.Rotation) as RotationComponent;
            mesh.rotation.y = rot.y;

            if (this.entityManager.getComponent(entity, ComponentId.CurrentPlayer)) {
                mesh.getObjectByName('camera').rotation.x = rot.x;
            } else {
                // Animation is only relevant for other players, as current player has no mesh.
                let physComponent = this.entityManager.getComponent(entity, ComponentId.Physics) as PhysicsComponent;
                if(Math.abs(physComponent.velX) > 0.01 || Math.abs(physComponent.velZ) > 0.01) {
                    if(mesh.getCurrentAnimation() != 'walk') {
                        mesh.playAnimation('walk');
                    }
                } else {
                    mesh.playAnimation('idle');
                }
                playerComponent.mesh.mixer.update(dt);
            }

        })
    }
}

export class PlayerSelectionSystem extends System {
    scene: Scene;
    debugArrow: Mesh;

    constructor(em: EntityManager, scene: Scene) {
        super(em);
        this.scene = scene;

        this.debugArrow = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), new MeshBasicMaterial(0xffffff));
        this.scene.add(this.debugArrow);
    }

    update(dt: number) {
        // Directional vectors. These never change.
        let xRot = new Vector3(1, 0, 0);
        let yRot = new Vector3(0, 1, 0);

        this.entityManager.getEntities(ComponentId.PlayerSelection).forEach((component, entity) => {
            // Load relevant components.
            let selectionComponent = component as PlayerSelectionComponent;
            let positionComponent = this.entityManager.getComponent(entity, ComponentId.Position) as PositionComponent;
            let rotComponent = this.entityManager.getComponent(entity, ComponentId.Rotation) as PositionComponent;

            // Get player's eye position, which we use for ray caster / collision detection origin.
            let [x, y, z] = [positionComponent.x, positionComponent.y+2.5, positionComponent.z];
            let pos = new Vector3(x, y, z);

            // Used for ray caster and chunk lookup.
            let rotVec = new Vector3(0, 0, -1).applyAxisAngle(xRot, rotComponent.x).applyAxisAngle(yRot, rotComponent.y);

            let chunkKeys = []; // use Array to retain order.
            for(let i = 0.01; i < 5; i++) {
                let blockVec = rotVec.clone().setLength(i).add(pos);

                // Add both rounded, floored and ceiled version of target position so we avoid all edge cases
                // (when player is in one chunk, and digs in neighbor chunk)
                let block = blockVec.round();
                let key = chunkKey(globalToChunk(block.x), globalToChunk(block.y), globalToChunk(block.z));
                if(chunkKeys.indexOf(key) === -1) chunkKeys.push(key);

                block = blockVec.floor();
                key = chunkKey(globalToChunk(block.x), globalToChunk(block.y), globalToChunk(block.z));
                if(chunkKeys.indexOf(key) === -1) chunkKeys.push(key);

                block = blockVec.ceil();
                key = chunkKey(globalToChunk(block.x), globalToChunk(block.y), globalToChunk(block.z));
                if(chunkKeys.indexOf(key) === -1) chunkKeys.push(key);
            }

            // Ray cast until we hit a block. First checks current chunk, then ones further away, if any.
            let ray = new Raycaster(pos, rotVec, 0.01, 5);
            let targetValid = false;
            for(let key of chunkKeys) {
                let meshComponent = this.entityManager.getComponent(key, ComponentId.Mesh) as MeshComponent;

                let hitPoint: Vector3 = null;
                if(meshComponent && meshComponent.mesh) {
                    let hits = ray.intersectObject(meshComponent.mesh);
                    if(hits.length) {
                        let hit = hits[0];
                        let point = hit.point;

                        // DEBUG
                        this.debugArrow.position.x = point.x;
                        this.debugArrow.position.y = point.y;
                        this.debugArrow.position.z = point.z;

                        // Cube data is offset by half a unit vs raycaster hit point.
                        // For negative values, subtract -0.5, for positive, add 0.5.
                        let cubeOffset = new Vector3(
                            Math.sign(point.x)/2.0,
                            Math.sign(point.y)/2.0,
                            Math.sign(point.z)/2.0
                        );

                        // Also subtract half of normal value to reach center of cube. Top face has normal
                        // of 1 pointing upwards, so subtracting half of that gets us precisely to the center of the
                        // cube, making the selector work correctly.
                        hitPoint = point.clone().add(cubeOffset).sub(
                            hit.face.normal.clone().divideScalar(2)
                        ).roundToZero();
                    }
                }

                // Did we hit the mesh during ray casting, and is there really a block there?
                if(hitPoint && findBlockMaterial(this.entityManager, hitPoint.x, hitPoint.y, hitPoint.z) !== 0) {
                    targetValid = true;
                    selectionComponent.target = [hitPoint.x, hitPoint.y, hitPoint.z];
                    selectionComponent.mesh.position.lerp(hitPoint, 0.75); // Lerp because it looks good. :-)
                    break;
                }
            }

            // Hide if target is not valid.
            selectionComponent.targetValid = targetValid;
            selectionComponent.mesh.visible = targetValid;

            if (!selectionComponent.mesh.parent) this.scene.add(selectionComponent.mesh);
        })
    }
}

export class MeshSystem extends System {
    scene: Scene;

    constructor(em: EntityManager, scene: Scene) {
        super(em);
        this.scene = scene;
    }

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.Mesh).forEach((component, entity) => {
            let meshComponent = component as MeshComponent;
            if(!meshComponent.mesh) return; // Mesh may be null.

            if (!meshComponent.mesh.parent) {
                this.scene.add(meshComponent.mesh);
            }

            let position = this.entityManager.getComponent(entity, ComponentId.Position) as PositionComponent;
            if (position) {
                meshComponent.mesh.position.x = position.x;
                meshComponent.mesh.position.y = position.y;
                meshComponent.mesh.position.z = position.z;
            }

            let rot = this.entityManager.getComponent(entity, ComponentId.Rotation) as RotationComponent;
            if (rot) {
                meshComponent.mesh.rotation.x = rot.x;
                meshComponent.mesh.rotation.y = rot.y;
                meshComponent.mesh.rotation.z = rot.z;
            }
        })
    }
}

export class TerrainChunkSystem extends System {
    scene: Scene;
    material: ShaderMaterial;

    constructor(em: EntityManager, scene: Scene, material: ShaderMaterial) {
        super(em);
        this.scene = scene;
        this.material = material;
    }

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.TerrainChunk).forEach((component, entity) => {
            let chunkComponent = component as TerrainChunkComponent;
            let meshComponent = (this.entityManager.getComponent(entity, ComponentId.Mesh) || this.entityManager.addComponent(entity, new MeshComponent())) as MeshComponent;

            if (chunkComponent.isDirty()) {
                console.log('Build chunk');
                let chunkGeom = buildChunkGeometry(chunkComponent.data);
                if(!chunkGeom) return;

                let mesh = meshComponent.mesh;
                if (meshComponent.mesh) {
                    mesh.geometry.dispose();
                    mesh.geometry = chunkGeom;
                }
                else mesh = new Mesh(chunkGeom, this.material);

                if (!meshComponent.mesh) {
                    meshComponent.mesh = mesh;
                    this.scene.add(mesh);
                }

                // Set chunk position. Add offsets so displayed mesh corresponds with collision detection and
                // lookups on the underlying data for the terrain chunk.
                mesh.position.x = chunkComponent.x * TERRAIN_CHUNK_SIZE;
                mesh.position.y = chunkComponent.y * TERRAIN_CHUNK_SIZE;
                mesh.position.z = chunkComponent.z * TERRAIN_CHUNK_SIZE;
            }
        })
    }
}

