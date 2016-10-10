import {System} from "../System";
import {ComponentId, TERRAIN_CHUNK_SIZE, PlayerJumpVelocity} from "../constants";
import {
    PositionComponent, PhysicsComponent, TerrainChunkComponent, OnGroundComponent,
    WallCollisionComponent
} from "../components";
import {chunkKey, mod, globalToChunk} from "../helpers";


export default class TerrainCollisionSystem extends System {
    update(dt: number): any {
        this.entityManager.getEntities(ComponentId.Physics).forEach((component, entity) => {
            let posComponent = this.entityManager.getComponent<PositionComponent>(entity, ComponentId.Position);
            let physComponent = component as PhysicsComponent;

            // Find the chunk coordinates based on current global position (16 -> 0 etc.)
            let [cx, cy, cz] = posComponent.toChunk();

            // Build a list of all neighbor chunks. These are the only ones we can possibly collide with.
            let chunks = {};
            for (let nz = -1; nz <= 1; nz++) {
                for (let ny = -1; ny <= 1; ny++) {
                    for (let nx = -1; nx <= 1; nx++) {
                        let key = chunkKey(cx + nx, cy + ny, cz + nz);
                        let chunkComponent = this.entityManager.getComponent<TerrainChunkComponent>(key, ComponentId.TerrainChunk);
                        if (chunkComponent) chunks[key] = chunkComponent;
                    }
                }
            }

            // Helper function for collision checks below.
            let checkCollisionAt = (nx, ny, nz) => {
                let [gx, gy, gz] = [posComponent.x + nx, posComponent.y + ny, posComponent.z + nz].map(c => Math.round(Math.abs(c)) * Math.sign(c));
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

            // Check and handle ground collisions. If player velY === PlayerJumpVelocity it means player jumped this
            // frame, and should not be anchored to ground again (have new OnGroundComponent assigned).
            let yOffsetFromBlock = mod(posComponent.y, 1); // Player position offset compared to real ground level / block level.
            if (physComponent.velY !== PlayerJumpVelocity && checkCollisionAt(0, -yOffsetFromBlock, 0)) {
                // Clamp to ground, so player doesn't hover.
                if(physComponent.velY < 0) {
                    posComponent.y = posComponent.y-yOffsetFromBlock+0.5;
                    physComponent.velY = 0.0;
                }

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
            let bcComponent = this.entityManager.getComponent<WallCollisionComponent>(entity, ComponentId.WallCollision);
            bcComponent.px = !!(checkCollisionAt(0.5, 0.5, 0) || checkCollisionAt(0.5, 1.5, 0) || checkCollisionAt(0.5, 2.5, 0));
            bcComponent.nx = !!(checkCollisionAt(-0.5, 0.5, 0) || checkCollisionAt(-0.5, 1.5, 0) || checkCollisionAt(-0.5, 2.5, 0));
            bcComponent.pz = !!(checkCollisionAt(0, 0.5, 0.5) || checkCollisionAt(0, 1.5, 0.5) || checkCollisionAt(0, 2.5, 0.5));
            bcComponent.nz = !!(checkCollisionAt(0, 0.5, -0.5) || checkCollisionAt(0, 1.5, -0.5) || checkCollisionAt(0, 2.5, -0.5));
        })
    }
}