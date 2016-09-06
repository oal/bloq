import * as Keymaster from 'keymaster';
import {Scene, Mesh, ShaderMaterial} from 'three';
import MouseManager from '../lib/MouseManager';

import EntityManager from "../../shared/EntityManager";
import {
    InputComponent, PositionComponent, RotationComponent, TerrainChunkComponent
} from "../../shared/components";
import Server from "./Server";
import {MeshComponent, PlayerComponent} from "./components";
import {buildChunkGeometry} from "./terrain";
import {TERRAIN_CHUNK_SIZE} from "../../shared/constants";
import {System} from "../../shared/systems";


export class PlayerInputSystem extends System {
    update(dt: number) {
        this.entityManager.getEntities('currentplayer').forEach((component, entity) => {
            // Keyboard
            let input = this.entityManager.getComponent(entity, 'input') as InputComponent;

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

            // Mouse
            let rot = this.entityManager.getComponent(entity, 'rotation') as RotationComponent;
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
        this.entityManager.getEntities('currentplayer').forEach((component, entity) => {
            let position = this.entityManager.getComponent(entity, 'position');
            let input = this.entityManager.getComponent(entity, 'input');

            if (input.isDirty()) {
                this.server.sendEntity({
                    entity: entity,
                    components: {
                        position: position,
                        input: input,
                    }
                });
                input.setDirty(false);
            }

            let rot = this.entityManager.getComponent(entity, 'rotation') as RotationComponent;
            if (rot.isDirty()) {
                this.server.sendEntity({
                    entity: entity,
                    components: {
                        rotation: rot,
                    }
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
        this.entityManager.getEntities('player').forEach((component, entity) => {
            let playerComponent = component as PlayerComponent;

            if (!playerComponent.mesh.parent) {
                this.scene.add(playerComponent.mesh);
            }

            let position = this.entityManager.getComponent(entity, 'position') as PositionComponent;
            playerComponent.mesh.position.x = position.x;
            playerComponent.mesh.position.y = position.y;
            playerComponent.mesh.position.z = position.z;

            let rot = this.entityManager.getComponent(entity, 'rotation') as RotationComponent;
            playerComponent.mesh.rotation.y = rot.y;

            if (this.entityManager.getComponent(entity, 'currentplayer')) {
                playerComponent.mesh.getObjectByName('camera').rotation.x = rot.x
            }
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
        this.entityManager.getEntities('mesh').forEach((component, entity) => {
            let meshComponent = component as MeshComponent;

            if (!meshComponent.mesh.parent) {
                this.scene.add(meshComponent.mesh);
            }

            let position = this.entityManager.getComponent(entity, 'position') as PositionComponent;
            if (position) {
                meshComponent.mesh.position.x = position.x;
                meshComponent.mesh.position.y = position.y;
                meshComponent.mesh.position.z = position.z;
            }

            let rot = this.entityManager.getComponent(entity, 'rotation') as RotationComponent;
            if (rot) {
                meshComponent.mesh.rotation.x = rot.x;
                meshComponent.mesh.rotation.y = rot.y;
                meshComponent.mesh.rotation.z = rot.z;
            }
        })
    }
}

export class RemoveEntitySystem extends System {
    update(dt: number) {
        this.entityManager.getEntities('removedentity').forEach((component, entity) => {
            this.entityManager.removeEntity(entity);
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
        this.entityManager.getEntities('terrainchunk').forEach((component, entity) => {
            let chunkComponent = component as TerrainChunkComponent;
            let meshComponent = (this.entityManager.getComponent(entity, 'mesh') || this.entityManager.addComponent(entity, new MeshComponent())) as MeshComponent;

            if (!meshComponent.mesh) {
                let chunkGeom = buildChunkGeometry(chunkComponent.data);
                let mesh = new Mesh(chunkGeom, this.material);
                mesh.position.x = chunkComponent.x * TERRAIN_CHUNK_SIZE;
                mesh.position.y = chunkComponent.y * TERRAIN_CHUNK_SIZE;
                mesh.position.z = chunkComponent.z * TERRAIN_CHUNK_SIZE;
                meshComponent.mesh = mesh;
                this.scene.add(mesh);
            }
        })
    }
}

