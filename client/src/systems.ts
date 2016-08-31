import * as Keymaster from 'keymaster';
import {Scene, Mesh, ShaderMaterial, Raycaster, Vector3} from 'three';
import MouseManager from '../lib/MouseManager';

import EntityManager from "../../shared/EntityManager";
import {
    InputComponent, PositionComponent, YawComponent, PhysicsComponent,
    OnGroundComponent
} from "../../shared/components";
import Server from "./Server";
import {MeshComponent, TerrainChunkComponent} from "./components";
import {buildChunkGeometry} from "./terrain";
import {globalToChunk, chunkKey, mod} from "../../shared/helpers";
import {TERRAIN_CHUNK_SIZE} from "../../shared/constants";


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

        // Never go below the ground level.
        let groundComponent = em.getComponent(entity, 'onground') as OnGroundComponent;
        if (groundComponent && posComponent.y < groundComponent.groundY) {
            posComponent.y = groundComponent.groundY;
        }

        // Build a list of all neighbor chunks. These are the only ones we can possibly collide with.
        let chunks = {};
        for (let nz = -1; nz <= 1; nz++) {
            for (let ny = -1; ny <= 1; ny++) {
                for (let nx = -1; nx <= 1; nx++) {
                    let key = chunkKey(cx, cy, cz);
                    let chunkComponent = em.getComponent(key, 'terrainchunk') as TerrainChunkComponent;
                    if (chunkComponent) chunks[key] = chunkComponent;
                }
            }
        }

        // TODO: This is fine for now, but can probably be optimized and made more smooth.
        // Check all blocks around player for collisions.
        for (let nz = -1; nz <= 1; nz++) {
            for (let ny = 0; ny <= 3; ny++) {
                for (let nx = -1; nx <= 1; nx++) {
                    if (nz === 0 && ny >= 0 && ny < 3 && nx === 0) continue;

                    let [gx, gy, gz] = [posComponent.x + nx, posComponent.y + ny + 1, posComponent.z + nz];
                    let [lx, ly, lz] = [
                        mod(gx, TERRAIN_CHUNK_SIZE) | 0,
                        mod(gy, TERRAIN_CHUNK_SIZE) | 0,
                        mod(gz, TERRAIN_CHUNK_SIZE) | 0
                    ];

                    let cx = globalToChunk(gx);
                    let cy = globalToChunk(gy);
                    let cz = globalToChunk(gz);

                    let key = chunkKey(cx, cy, cz);
                    let chunk = chunks[key];
                    if (!chunk) return;

                    if (chunk.getValue(lx, ly, lz)) {
                        physComponent.velX -= nx / 25;
                        physComponent.velZ -= nz / 25;
                    }
                }
            }
        }

        // TODO: Same here.
        // Cast rays for collision check downward.
        let key = chunkKey(cx, cy, cz);
        if (chunks[key]) {
            // Rays
            let [x, y, z] = [posComponent.x, posComponent.y, posComponent.z];
            let ray = new Raycaster(new Vector3(x, y+1, z), new Vector3(0, -1, 0), 0.0, 1.5);

            let intersectDown = ray.intersectObject(chunks[key].mesh);
            if (intersectDown.length) {
                let groundLevel = intersectDown[0].point.y;
                em.addComponent(entity, new OnGroundComponent(groundLevel));

                physComponent.velY = 0;
                physComponent.setDirty(true);
            } else {
                em.removeComponentType(entity, 'onground');
            }
        } else {
            em.removeComponentType(entity, 'onground');
        }
    })
}