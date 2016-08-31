import * as Keymaster from 'keymaster';
import {Scene, Mesh, ShaderMaterial} from 'three';
import MouseManager from '../lib/MouseManager';

import EntityManager from "../../shared/EntityManager";
import {InputComponent, PositionComponent, YawComponent} from "../../shared/components";
import Server from "./Server";
import {MeshComponent, TerrainChunkComponent} from "./components";
import {TERRAIN_CHUNK_SIZE} from "./constants";
import {buildChunkGeometry} from "./terrain";


export function updatePlayerInputs(em: EntityManager, dt) {
    em.getEntities('currentplayer').forEach((component, entity) => {
        // Keyboard
        let input = em.getComponent(entity, 'input') as InputComponent;

        let moveForward = Keymaster.isPressed('W'.charCodeAt(0));
        let moveLeft = Keymaster.isPressed('A'.charCodeAt(0));
        let moveRight = Keymaster.isPressed('D'.charCodeAt(0));
        let moveBackward = Keymaster.isPressed('S'.charCodeAt(0));

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

        // Mouse
        let yaw = em.getComponent(entity, 'yaw') as YawComponent;
        let [dx, dy] = MouseManager.delta();
        if(dx !== 0) {
            yaw.rot -= dx/5.0 * dt;
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

        if(!meshComponent.mesh.parent) {
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

        if(!chunkComponent.mesh) {
            let data = new Uint8Array(TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE);
            //console.log(chunkComponent.data)
            //debugger;
            for(let idx in chunkComponent.data) {
                //if(!chunkComponent.hasOwnProperty(idx)) continue;
                data[+idx] = chunkComponent.data[idx]
                //debugger;
            }
            let chunkGeom = buildChunkGeometry(data);
            let mesh = new Mesh(chunkGeom, material);
            scene.add(mesh);
        }
    })
}