import EntityManager from "./EntityManager";
import {
    PositionComponent, InputComponent, PhysicsComponent, WallCollisionComponent,
    RotationComponent, OnGroundComponent, TerrainChunkComponent
} from "./components";
import {chunkKey, globalToChunk, mod} from "./helpers";
import {TERRAIN_CHUNK_SIZE, ComponentId} from "./constants";
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
        this.entityManager.getEntities(ComponentId.Physics).forEach((component, entity) => {
            let input = this.entityManager.getComponent(entity, ComponentId.Input) as InputComponent;

            let rotation = this.entityManager.getComponent(entity, ComponentId.Rotation) as RotationComponent;

            let physComponent = component as PhysicsComponent;

            let speed = dt * 4;
            let sinSpeed = Math.sin(rotation.y) * speed;
            let cosSpeed = Math.cos(rotation.y) * speed;
            if (input.moveForward) {
                physComponent.velX -= sinSpeed;
                physComponent.velZ -= cosSpeed;
            }
            if (input.moveLeft) {
                physComponent.velX -= cosSpeed;
                physComponent.velZ += sinSpeed;
            }
            if (input.moveRight) {
                physComponent.velX += cosSpeed;
                physComponent.velZ -= sinSpeed;
            }
            if (input.moveBackward) {
                physComponent.velX += sinSpeed;
                physComponent.velZ += cosSpeed;
            }
            if (input.jump) {
                let onGround = this.entityManager.getComponent(entity, ComponentId.OnGround) as OnGroundComponent;
                if (onGround && onGround.canJump) {
                    physComponent.velY = 0.25;
                    this.entityManager.removeComponentType(entity, ComponentId.OnGround);
                }
            }

            // Are we colliding with a block in the world? If so, allow no more movement in that direction.
            let blockCollision = this.entityManager.getComponent(entity, ComponentId.WallCollision) as WallCollisionComponent;
            if (blockCollision.px && physComponent.velX > 0) physComponent.velX = 0;
            if (blockCollision.nx && physComponent.velX < 0) physComponent.velX = 0;
            if (blockCollision.pz && physComponent.velZ > 0) physComponent.velZ = 0;
            if (blockCollision.nz && physComponent.velZ < 0) physComponent.velZ = 0;
        })
    }
}


export class PhysicsSystem extends System {
    update(dt: number): any {
        this.entityManager.getEntities(ComponentId.Physics).forEach((component, entity) => {
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
        this.entityManager.getEntities(ComponentId.Physics).forEach((component, entity) => {
            // Get physics.
            let physComponent = component as PhysicsComponent;

            // Update positions.
            let posComponent = this.entityManager.getComponent(entity, ComponentId.Position) as PositionComponent;
            posComponent.x += physComponent.velX;
            posComponent.y += physComponent.velY;
            posComponent.z += physComponent.velZ;
        })
    }
}

export class TerrainCollisionSystem extends System {
    update(dt: number): any {
        this.entityManager.getEntities(ComponentId.Physics).forEach((component, entity) => {
            let posComponent = this.entityManager.getComponent(entity, ComponentId.Position) as PositionComponent;
            let physComponent = component as PhysicsComponent;

            // Find the chunk coordinates based on current global position (12 -> 0 etc.)
            let [cx, cy, cz] = posComponent.toChunk();

            // Build a list of all neighbor chunks. These are the only ones we can possibly collide with.
            let chunks = {};
            for (let nz = -1; nz <= 1; nz++) {
                for (let ny = -1; ny <= 1; ny++) {
                    for (let nx = -1; nx <= 1; nx++) {
                        let key = chunkKey(cx + nx, cy + ny, cz + nz);
                        let chunkComponent = this.entityManager.getComponent(key, ComponentId.TerrainChunk) as TerrainChunkComponent;
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
            if (checkCollisionAt(0, -0.25, 0)) {
                physComponent.velY = 0.0;
                let onGround = new OnGroundComponent();
                onGround.canJump = !checkCollisionAt(0, 3, 0); // Only able to jump unless there is a block overhead
                this.entityManager.addComponent(entity, onGround);
            } else {
                this.entityManager.removeComponentType(entity, ComponentId.OnGround);
            }

            // If there's a block above the player, never allow upward movement.
            if (checkCollisionAt(0, 3, 0)) {
                physComponent.velY = Math.min(physComponent.velY, 0.0);
            }

            // Check and update block collision component (wall collisions).
            let bcComponent = this.entityManager.getComponent(entity, ComponentId.WallCollision) as WallCollisionComponent;
            bcComponent.px = !!(checkCollisionAt(1, 0.25, 0) || checkCollisionAt(1, 1.25, 0) || checkCollisionAt(1, 2.25, 0));
            bcComponent.nx = !!(checkCollisionAt(-1, 0.25, 0) || checkCollisionAt(-1, 1.25, 0) || checkCollisionAt(-1, 2.25, 0));
            bcComponent.pz = !!(checkCollisionAt(0, 0.25, 1) || checkCollisionAt(0, 1.25, 1) || checkCollisionAt(0, 2.25, 1));
            bcComponent.nz = !!(checkCollisionAt(0, 0.25, -1) || checkCollisionAt(0, 1.25, -1) || checkCollisionAt(0, 2.25, -1));
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

export class CleanComponentsSystem extends System {
    update(dt: number): any {
        this.entityManager.cleanComponents();
    }
}