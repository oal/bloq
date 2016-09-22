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