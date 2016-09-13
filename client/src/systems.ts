import * as Keymaster from 'keymaster';
import {Scene, Mesh, ShaderMaterial, Vector3, CubeGeometry, AnimationMixer} from 'three';
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
                input.setDirty(true);
            }
            if (moveLeft !== input.moveLeft) {
                input.moveLeft = moveLeft;
                input.setDirty(true);
            }
            if (moveRight !== input.moveRight) {
                input.moveRight = moveRight;
                input.setDirty(true);
            }
            if (moveBackward !== input.moveBackward) {
                input.moveBackward = moveBackward;
                input.setDirty(true);
            }
            if (jump !== input.jump) {
                input.jump = jump;
                input.setDirty(true);
            }

            // Mouse movement
            let rot = this.entityManager.getComponent(entity, ComponentId.Rotation) as RotationComponent;
            let [dx, dy] = MouseManager.delta();
            if (dx !== 0) {
                rot.y -= dx / 5.0 * dt;
                rot.setDirty(true);
            }
            if (dy !== 0) {
                rot.x -= dy / 5.0 * dt;
                if (rot.x < -Math.PI / 2.0) rot.x = -Math.PI / 2.0;
                else if (rot.x > Math.PI / 2.0) rot.x = Math.PI / 2.0;
                rot.setDirty(true);
            }

            // Mouse clicks (and maybe also keypad in the future)
            let actionPrimary = MouseManager.isLeftButtonPressed();
            let actionSecondary = MouseManager.isLeftButtonPressed();
            if ((actionPrimary && !input.primaryAction) || (actionSecondary && !input.secondaryAction)) {
                let selectionComponent = this.entityManager.getComponent(entity, ComponentId.PlayerSelection) as PlayerSelectionComponent;
                input.actionTarget = selectionComponent.target;
            }
            if (actionPrimary != input.primaryAction) {
                input.primaryAction = actionPrimary;
                input.setDirty(true);
            }
            if (actionSecondary != input.secondaryAction) {
                input.secondaryAction = actionSecondary;
                input.setDirty(true);
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
                input.setDirty(false);
            }

            let rot = this.entityManager.getComponent(entity, ComponentId.Rotation) as RotationComponent;
            if (rot.isDirty()) {
                let components = {};
                components[ComponentId.Rotation] = rot;
                this.server.sendEntity({
                    entity: entity,
                    components: components
                });
                rot.setDirty(false);
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
            }

            // Animation
            let physComponent = this.entityManager.getComponent(entity, ComponentId.Physics) as PhysicsComponent;
            if(Math.abs(physComponent.velX) > 0.01 || Math.abs(physComponent.velZ) > 0.01) {
                if(mesh.getCurrentAnimation() != 'walk') {
                    mesh.playAnimation('walk');
                }
            } else {
                mesh.playAnimation('idle');
            }
            playerComponent.mesh.mixer.update(dt);
        })
    }
}

export class PlayerSelectionSystem extends System {
    scene: Scene;

    constructor(em: EntityManager, scene: Scene) {
        super(em);
        this.scene = scene;
    }

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.PlayerSelection).forEach((component, entity) => {
            let selectionComponent = component as PlayerSelectionComponent;
            let positionComponent = this.entityManager.getComponent(entity, ComponentId.Position) as PositionComponent;
            let rotComponent = this.entityManager.getComponent(entity, ComponentId.Rotation) as PositionComponent;

            let [x, y, z] = [positionComponent.x, positionComponent.y+2, positionComponent.z];

            let pos = new Vector3(x, y, z);
            let xRot = new Vector3(1, 0, 0);
            let yRot = new Vector3(0, 1, 0);

            let rotVec = new Vector3(0, 0, -1).applyAxisAngle(xRot, rotComponent.x).applyAxisAngle(yRot, rotComponent.y);

            let targetValid = false;
            for (let dist = 0.1; dist < 5; dist++) {
                // Update rotation vector's length to project further and further away.
                rotVec.setLength(dist);

                // Take rotation, add 2 for head position, and add player's position.
                let target = new Vector3().copy(rotVec).add(pos).round();
                if (findBlockMaterial(this.entityManager, target.x, target.y, target.z) !== 0) {
                    selectionComponent.target = [target.x, target.y, target.z];

                    //selectionComponent.mesh.position.set(target.x, target.y, target.z);
                    selectionComponent.mesh.position.lerp(target, 0.75); // Lerp because it looks good. :-)
                    targetValid = true;
                    break;
                }
            }

            // Hide if target is not valid.
            if(selectionComponent.targetValid != targetValid) selectionComponent.setDirty(true);
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

            if (chunkComponent.isDirty() || !meshComponent.mesh) {
                if (meshComponent.mesh) console.log('Rebuilding existing chunk!');
                let chunkGeom = buildChunkGeometry(chunkComponent.data);
                let mesh;
                if (chunkGeom) mesh = new Mesh(chunkGeom, this.material);
                else mesh = new Mesh(new CubeGeometry(0.1, 0.1, 0.1), this.material); // Debug

                // Set chunk position. Add offsets so displayed mesh corresponds with collision detection and
                // lookups on the underlying data for the terrain chunk.
                mesh.position.x = chunkComponent.x * TERRAIN_CHUNK_SIZE - 1;
                mesh.position.y = chunkComponent.y * TERRAIN_CHUNK_SIZE - 0.5;
                mesh.position.z = chunkComponent.z * TERRAIN_CHUNK_SIZE - 1;

                // Remove old (if any) and insert new.
                if (meshComponent.mesh) this.scene.remove(meshComponent.mesh);
                meshComponent.mesh = mesh;
                this.scene.add(mesh);
                chunkComponent.setDirty(false);

                // Only build one mesh per frame to avoid FPS drop.
                return;
            }
        })
    }
}

