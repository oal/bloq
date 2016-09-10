import EntityManager from "./EntityManager";
import {
    PositionComponent, InputComponent, PhysicsComponent, WallCollisionComponent,
    RotationComponent, OnGroundComponent, TerrainChunkComponent
} from "./components";
import {chunkKey, globalToChunk, mod} from "./helpers";
import {TERRAIN_CHUNK_SIZE} from "./constants";
import {ActionManager} from "./actions";

export class System {
    entityManager: EntityManager;

    constructor(em: EntityManager) {
        this.entityManager = em;
    }

    update(dt: number) {
        console.warn('Please override update.')
    }
}

export class MovementSystem extends System {
    update(dt: number): any {
        this.entityManager.getEntities('physics').forEach((component, entity) => {
            let input = this.entityManager.getComponent(entity, 'input') as InputComponent;

            let rotation = this.entityManager.getComponent(entity, 'rotation') as RotationComponent;

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
            if (input.jump && this.entityManager.getComponent(entity, 'onground')) {
                physComponent.velY = 0.25;
                this.entityManager.removeComponentType(entity, 'onground');
                physComponent.setDirty(true);
            }

            // Are we colliding with a block in the world? If so, allow no more movement in that direction.
            let blockCollision = this.entityManager.getComponent(entity, 'wallcollision') as WallCollisionComponent;
            if (blockCollision.px && physComponent.velX > 0) physComponent.velX = 0;
            if (blockCollision.nx && physComponent.velX < 0) physComponent.velX = 0;
            if (blockCollision.pz && physComponent.velZ > 0) physComponent.velZ = 0;
            if (blockCollision.nz && physComponent.velZ < 0) physComponent.velZ = 0;
        })
    }
}


export class PhysicsSystem extends System {
    update(dt: number): any {
        this.entityManager.getEntities('physics').forEach((component, entity) => {
            // Update physics.
            let physComponent = component as PhysicsComponent;

            physComponent.velY -= dt * 2;
            if (physComponent.velY < -1) physComponent.velY = -1;

            // TODO: Should use delta time here somewhere.
            physComponent.velX *= 30 * dt;
            physComponent.velZ *= 30 * dt;
        })
    }
}

export class PositionSystem extends System {
    update(dt: number): any {
        this.entityManager.getEntities('physics').forEach((component, entity) => {
            // Get physics.
            let physComponent = component as PhysicsComponent;

            // Update positions.
            let posComponent = this.entityManager.getComponent(entity, 'position') as PositionComponent;
            posComponent.x += physComponent.velX;
            posComponent.y += physComponent.velY;
            posComponent.z += physComponent.velZ;
            posComponent.setDirty(true);
        })
    }
}

export class TerrainCollisionSystem extends System {
    update(dt: number): any {
        this.entityManager.getEntities('physics').forEach((component, entity) => {
            let posComponent = this.entityManager.getComponent(entity, 'position') as PositionComponent;
            let physComponent = component as PhysicsComponent;

            // Find the chunk coordinates based on current global position (12 -> 0 etc.)
            let [cx, cy, cz] = posComponent.toChunk();

            // Build a list of all neighbor chunks. These are the only ones we can possibly collide with.
            let chunks = {};
            for (let nz = -1; nz <= 1; nz++) {
                for (let ny = -1; ny <= 1; ny++) {
                    for (let nx = -1; nx <= 1; nx++) {
                        let key = chunkKey(cx + nx, cy + ny, cz + nz);
                        let chunkComponent = this.entityManager.getComponent(key, 'terrainchunk') as TerrainChunkComponent;
                        if (chunkComponent) chunks[key] = chunkComponent;
                    }
                }
            }

            // Helper function for collision checks below.
            let checkCollisionAt = (nx, ny, nz) => {
                let [gx, gy, gz] = [posComponent.x + nx / 2, posComponent.y + ny, posComponent.z + nz / 2].map(c => Math.round(Math.abs(c)) * Math.sign(c));
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

                return chunk.getValue(lx, ly, lz)
            };

            // Check and handle ground collisions.
            if (checkCollisionAt(0, -0.25, 0) || checkCollisionAt(0, 2, 0)) {
                physComponent.velY = 0.0;
                this.entityManager.addComponent(entity, new OnGroundComponent());
            } else {
                //console.log('No gound', posComponent.x, posComponent.z, Object.keys(chunks));
                this.entityManager.removeComponentType(entity, 'onground');
            }

            // Check and update block collision component (wall collisions).
            let bcComponent = this.entityManager.getComponent(entity, 'wallcollision') as WallCollisionComponent;
            bcComponent.px = !!(checkCollisionAt(1, 0.25, 0) || checkCollisionAt(1, 1.25, 0));
            bcComponent.nx = !!(checkCollisionAt(-1, 0.25, 0) || checkCollisionAt(-1, 1.25, 0));
            bcComponent.pz = !!(checkCollisionAt(0, 0.25, 1) || checkCollisionAt(0, 1.25, 1));
            bcComponent.nz = !!(checkCollisionAt(0, 0.25, -1) || checkCollisionAt(0, 1.25, -1));
        })
    }
}

export class ActionExecutionSystem extends System {
    actionManager: ActionManager;

    constructor(entityManager: EntityManager, actionManager: ActionManager) {
        super(entityManager);
        this.actionManager = actionManager;
    }

    update(dt: number): any {
        this.actionManager.executeAll(this.entityManager);
    }
}