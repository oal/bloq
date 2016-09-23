import {System} from "../systems";
import {ComponentId, TERRAIN_CHUNK_SIZE} from "../constants";
import {
    PositionComponent, PhysicsComponent, TerrainChunkComponent, OnGroundComponent,
    WallCollisionComponent
} from "../components";
import {chunkKey, mod, globalToChunk} from "../helpers";


export default class TerrainCollisionSystem extends System {
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
                // Add 0.5 because center of block in the world is half a unit off from underlying chunk data.
                let [gx, gy, gz] = [posComponent.x + nx+0.5, posComponent.y + ny+0.5, posComponent.z + nz+0.5];

                let cx = globalToChunk(gx);
                let cy = globalToChunk(gy);
                let cz = globalToChunk(gz);

                let [lx, ly, lz] = [
                    mod(Math.floor(gx), TERRAIN_CHUNK_SIZE),
                    mod(Math.floor(gy), TERRAIN_CHUNK_SIZE),
                    mod(Math.floor(gz), TERRAIN_CHUNK_SIZE)
                ];

                let key = chunkKey(cx, cy, cz);
                let chunk = chunks[key];
                if (!chunk) return false;

                return chunk.getValue(lx, ly, lz)
            };

            // Check and handle ground collisions.
            if (checkCollisionAt(0, -0.1, 0)) {
                // Clamp to ground, so player doesn't hover.
                if (physComponent.velY < 0.0) {
                    posComponent.y = (Math.round(Math.abs(posComponent.y) * 2) * Math.sign(posComponent.y)) / 2
                }
                physComponent.velY = 0.0;
                let onGround = new OnGroundComponent();
                onGround.canJump = !checkCollisionAt(0, 3.1, 0); // Only able to jump unless there is a block overhead
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
            bcComponent.px = !!(checkCollisionAt(0.5, 0.5, 0) || checkCollisionAt(0.5, 1.5, 0) || checkCollisionAt(0.5, 2.5, 0));
            bcComponent.nx = !!(checkCollisionAt(-0.5, 0.5, 0) || checkCollisionAt(-0.5, 1.5, 0) || checkCollisionAt(-0.5, 2.5, 0));
            bcComponent.pz = !!(checkCollisionAt(0, 0.5, 0.5) || checkCollisionAt(0, 1.5, 0.5) || checkCollisionAt(0, 2.5, 0.5));
            bcComponent.nz = !!(checkCollisionAt(0, 0.5, -0.5) || checkCollisionAt(0, 1.5, -0.5) || checkCollisionAt(0, 2.5, -0.5));
        })
    }
}