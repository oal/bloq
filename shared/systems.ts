import EntityManager from "./EntityManager";
import {
    PositionComponent, InputComponent, PhysicsComponent, WallCollisionComponent,
    RotationComponent, OnGroundComponent, TerrainChunkComponent
} from "./components";
import {chunkKey, globalToChunk, mod} from "./helpers";
import {TERRAIN_CHUNK_SIZE} from "./constants";


export function updateMovement(em: EntityManager, dt) {
    em.getEntities('physics').forEach((component, entity) => {
        let input = em.getComponent(entity, 'input') as InputComponent;

        let rotation = em.getComponent(entity, 'rotation') as RotationComponent;

        let physComponent = component as PhysicsComponent;
        physComponent.setDirty(false);

        let speed = dt * 4;
        let sinSpeed = Math.sin(rotation.y) * speed;
        let cosSpeed = Math.cos(rotation.y) * speed;
        if (input.moveForward) {
            physComponent.velX -= sinSpeed;
            physComponent.velZ -= cosSpeed;
            physComponent.setDirty(true);
        }
        if (input.moveLeft) {
            physComponent.velX -= cosSpeed;
            physComponent.velZ += sinSpeed;
            physComponent.setDirty(true);
        }
        if (input.moveRight) {
            physComponent.velX += cosSpeed;
            physComponent.velZ -= sinSpeed;
            physComponent.setDirty(true);
        }
        if (input.moveBackward) {
            physComponent.velX += sinSpeed;
            physComponent.velZ += cosSpeed;
            physComponent.setDirty(true);
        }
        if (input.jump && em.getComponent(entity, 'onground')) {
            physComponent.velY = 0.25;
            em.removeComponentType(entity, 'onground');
            physComponent.setDirty(true);
        }

        // Are we colliding with a block in the world? If so, allow no more movement in that direction.
        let blockCollision = em.getComponent(entity, 'wallcollision') as WallCollisionComponent;
        if (blockCollision.px && physComponent.velX > 0) physComponent.velX = 0;
        if (blockCollision.nx && physComponent.velX < 0) physComponent.velX = 0;
        if (blockCollision.pz && physComponent.velZ > 0) physComponent.velZ = 0;
        if (blockCollision.nz && physComponent.velZ < 0) physComponent.velZ = 0;
    })
}


export function updatePhysics(em: EntityManager, dt) {
    em.getEntities('physics').forEach((component, entity) => {
        // Update physics.
        let physComponent = component as PhysicsComponent;

        physComponent.velY -= dt * 2;
        if (physComponent.velY < -1) physComponent.velY = -1;

        // TODO: Should use delta time here somewhere.
        physComponent.velX *= 30 * dt;
        physComponent.velZ *= 30 * dt;
    })
}

export function updatePositions(em: EntityManager, dt) {
    em.getEntities('physics').forEach((component, entity) => {
        // Get physics.
        let physComponent = component as PhysicsComponent;

        // Update positions.
        let posComponent = em.getComponent(entity, 'position') as PositionComponent;
        posComponent.x += physComponent.velX;
        posComponent.y += physComponent.velY;
        posComponent.z += physComponent.velZ;
        posComponent.setDirty(true);
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
        if (checkCollisionAt(0, -1, 0) || checkCollisionAt(0, 2, 0)) {
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
