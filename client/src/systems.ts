import * as Keymaster from 'keymaster';
import {Scene, Mesh, ShaderMaterial, Raycaster, Vector3} from 'three';
import MouseManager from '../lib/MouseManager';

import EntityManager from "../../shared/EntityManager";
import {
    InputComponent, PositionComponent, PhysicsComponent,
    OnGroundComponent, WallCollisionComponent, RotationComponent
} from "../../shared/components";
import Server from "./Server";
import {MeshComponent, TerrainChunkComponent, PlayerComponent} from "./components";
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
        let rot = em.getComponent(entity, 'rotation') as RotationComponent;
        let [dx, dy] = MouseManager.delta();
        console.log(dx, dy)
        if (dx !== 0) {
            rot.y -= dx / 5.0 * dt;
            rot.setDirty(true);
        }
        if(dy !== 0) {
            rot.x -= dy / 5.0 * dt;
            rot.setDirty(true);
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

        let rot = em.getComponent(entity, 'rotation') as RotationComponent;
        if (rot.isDirty()) {
            server.send({
                entity: entity,
                components: {
                    rotation: rot,
                }
            });
            rot.setDirty(false);
        }
    })
}

export function updatePlayerMeshes(em: EntityManager, scene: Scene) {
    em.getEntities('player').forEach((component, entity) => {
        let playerComponent = component as PlayerComponent;

        if(!playerComponent.mesh.parent) {
            scene.add(playerComponent.mesh);
        }

        let position = em.getComponent(entity, 'position') as PositionComponent;
        playerComponent.mesh.position.x = position.x;
        playerComponent.mesh.position.y = position.y;
        playerComponent.mesh.position.z = position.z;

        let rot = em.getComponent(entity, 'rotation') as RotationComponent;
        playerComponent.mesh.rotation.y = rot.y;

        playerComponent.mesh.getObjectByName('camera').rotation.x = rot.x
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

        let rot = em.getComponent(entity, 'rotation') as RotationComponent;
        meshComponent.mesh.rotation.x = rot.x;
        meshComponent.mesh.rotation.y = rot.y;
        meshComponent.mesh.rotation.z = rot.z;
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
        let posComponent = em.getComponent(entity, 'position') as PositionComponent;

        // Find the chunk coordinates based on current global position (12 -> 0 etc.)
        let cx = globalToChunk(posComponent.x);
        let cy = globalToChunk(posComponent.y);
        let cz = globalToChunk(posComponent.z);

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

        // Helper function for collision checks below.
        let checkCollisionAt = (nx, ny, nz) => {
            let [gx, gy, gz] = [posComponent.x + nx, posComponent.y + ny, posComponent.z + nz];
            let [lx, ly, lz] = [
                mod(gx, TERRAIN_CHUNK_SIZE),
                mod(gy, TERRAIN_CHUNK_SIZE),
                mod(gz, TERRAIN_CHUNK_SIZE)
            ];

            let cx = globalToChunk(gx);
            let cy = globalToChunk(gy);
            let cz = globalToChunk(gz);

            let key = chunkKey(cx, cy, cz);
            let chunk = chunks[key];
            if (!chunk) return false;

            return chunk.getValue(Math.round(lx), Math.round(ly), Math.round(lz))
        };

        // TODO: Actually hit ground instead of hover.
        // Check and handle ground collisions.
        if(checkCollisionAt(0, -1, 0) || checkCollisionAt(0, 2, 0)) {
            let physComponent = component as PhysicsComponent;
            physComponent.velY = 0.0;
            em.addComponent(entity, new OnGroundComponent());
        } else {
            em.removeComponentType(entity, 'onground');
        }

        // Check and update block collision component (wall collisions).
        let bcComponent = em.getComponent(entity, 'wallcollision') as WallCollisionComponent;
        bcComponent.px = !!(checkCollisionAt(1, 0, 0) || checkCollisionAt(1, 1, 0));
        bcComponent.nx = !!(checkCollisionAt(-1, 0, 0) || checkCollisionAt(-1, 1, 0));
        bcComponent.pz = !!(checkCollisionAt(0, 0, 1) || checkCollisionAt(0, 1, 1));
        bcComponent.nz = !!(checkCollisionAt(0, 0, -1) || checkCollisionAt(0, 1, -1));
    })
}