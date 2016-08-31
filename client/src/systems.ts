import * as Keymaster from 'keymaster';
import {Scene, Mesh, ShaderMaterial} from 'three';
import MouseManager from '../lib/MouseManager';

import EntityManager from "../../shared/EntityManager";
import {
    InputComponent, PositionComponent, YawComponent, PhysicsComponent,
    OnGroundComponent
} from "../../shared/components";
import Server from "./Server";
import {MeshComponent, TerrainChunkComponent} from "./components";
import {buildChunkGeometry} from "./terrain";
import {TERRAIN_CHUNK_SIZE} from "../../shared/constants";
import {globalToChunk, chunkKey, mod} from "../../shared/helpers";


export function updatePlayerInputs(em: EntityManager, dt) {
    em.getEntities('currentplayer').forEach((component, entity) => {
        // Keyboard
        let input = em.getComponent(entity, 'input') as InputComponent;

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
        let yaw = em.getComponent(entity, 'yaw') as YawComponent;
        let [dx, dy] = MouseManager.delta();
        if (dx !== 0) {
            yaw.rot -= dx / 5.0 * dt;
            yaw.setDirty(true);
        }
    })
}

export function syncPlayer(em: EntityManager, server: Server) {
    em.getEntities('currentplayer').forEach((component, entity) => {
        let position = em.getComponent(entity, 'position');
        let input = em.getComponent(entity, 'input');

        if (input.isDirty()) {
            server.send({
                entity: entity,
                components: {
                    position: position,
                    input: input,
                }
            });
            input.setDirty(false);
        }

        let yaw = em.getComponent(entity, 'yaw');
        if (yaw.isDirty()) {
            server.send({
                entity: entity,
                components: {
                    yaw: yaw,
                }
            });
            yaw.setDirty(false);
        }
    })
}

export function updateMeshes(em: EntityManager, scene: Scene) {
    em.getEntities('mesh').forEach((component, entity) => {
        let meshComponent = component as MeshComponent;

        if (!meshComponent.mesh.parent) {
            scene.add(meshComponent.mesh);
        }

        let position = em.getComponent(entity, 'position') as PositionComponent;
        meshComponent.mesh.position.x = position.x;
        meshComponent.mesh.position.y = position.y;
        meshComponent.mesh.position.z = position.z;

        let yaw = em.getComponent(entity, 'yaw') as YawComponent;
        meshComponent.mesh.rotation.y = yaw.rot;
    })
}

export function removeEntities(em: EntityManager) {
    em.getEntities('removedentity').forEach((component, entity) => {
        em.removeEntity(entity);
    })
}

export function updateTerrainChunks(em: EntityManager, scene: Scene, material: ShaderMaterial) {
    em.getEntities('terrainchunk').forEach((component, entity) => {
        let chunkComponent = component as TerrainChunkComponent;

        if (!chunkComponent.mesh) {
            let chunkGeom = buildChunkGeometry(chunkComponent.data);
            let mesh = new Mesh(chunkGeom, material);
            chunkComponent.mesh = mesh;
            scene.add(mesh);
        }
    })
}

export function updateTerrainCollision(em: EntityManager) {
    em.getEntities('physics').forEach((component, entity) => {
        let physComponent = component as PhysicsComponent;
        let posComponent = em.getComponent(entity, 'position') as PositionComponent;
        let cx = globalToChunk(posComponent.x);
        let cy = globalToChunk(posComponent.y);
        let cz = globalToChunk(posComponent.z);

        let [lx, ly, lz] = [
            mod(posComponent.x, TERRAIN_CHUNK_SIZE) | 0,
            mod(posComponent.y, TERRAIN_CHUNK_SIZE) | 0,
            mod(posComponent.z, TERRAIN_CHUNK_SIZE) | 0
        ];

        let key = chunkKey(cx, cy, cz);
        let chunkComponent = em.getComponent(key, 'terrainchunk') as TerrainChunkComponent;
        if (chunkComponent && chunkComponent.getValue(lx, ly, lz)) {
            physComponent.velY = 0;
            em.addComponent(entity, new OnGroundComponent());

            physComponent.setDirty(true);
            posComponent.setDirty(true);
        }
    })
}