import {System} from "../../../shared/System";
import {Terrain} from "../terrain";
import EntityManager from "../../../shared/EntityManager";
import {ComponentId, ActionId} from "../../../shared/constants";
import {ChunkSubscriptionComponent, NetworkComponent} from "../components";
import {PositionComponent, TerrainChunkComponent} from "../../../shared/components";
import {arraysEqual, chunkKey} from "../../../shared/helpers";
import Server from "../Server";
import {UnsubscribeTerrainChunksAction} from "../../../shared/actions";


let clock = (start): (number | number[]) => {
    if (!start) return process.hrtime();
    let end = process.hrtime(start);
    return Math.round((end[0] * 1000) + (end[1] / 1000000));
};

export default class ChunkSubscriptionSystem extends System {
    terrain: Terrain;
    chunkQueue: Array<[[number, number, number], string]> = [];

    constructor(em: EntityManager, terrain: Terrain) {
        super(em);
        this.terrain = terrain;
    }

    private queueChunkFor(x: number, y: number, z: number, entity: string) {
        this.chunkQueue.push([[x, y, z], entity]);
    }

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.ChunkSubscription).forEach((component, entity) => {
            let chunkSubComponent = component as ChunkSubscriptionComponent;
            let posComponent = this.entityManager.getComponent<PositionComponent>(entity, ComponentId.Position);
            let netComponent = this.entityManager.getComponent<NetworkComponent>(entity, ComponentId.Network);

            // Do we need to update chunk subscriptions?
            let currChunk = posComponent.toChunk();
            if (!arraysEqual(currChunk, chunkSubComponent.inChunk)) {
                let newChunkSubs = new Map<string, boolean>();
                chunkSubComponent.inChunk = currChunk;

                // Look through the view area for the player and notify of new chunks in view.
                const viewDist = 4;
                for (let dist = 0; dist <= viewDist; dist++) {
                    for (let z = -viewDist; z <= viewDist; z++) {
                        for (let y = -viewDist / 2; y <= viewDist / 2; y++) {
                            for (let x = -viewDist; x <= viewDist; x++) {
                                let realDist = Math.sqrt(x * x + y * y + z * z);
                                if (realDist < dist || realDist > dist + 1) continue;

                                let [cx, cy, cz] = [currChunk[0] + x, currChunk[1] + y, currChunk[2] + z];
                                let key = chunkKey(cx, cy, cz);
                                newChunkSubs.set(key, true);

                                // If this chunk key wasn't already subscribed to, player needs to receive chunk data:
                                if (!chunkSubComponent.chunks.has(key)) {
                                    this.queueChunkFor(cx, cy, cz, entity);
                                }
                            }
                        }
                    }
                }


                // Signal that the chunks too far away be removed.
                let unsubChunks = [];
                chunkSubComponent.chunks.forEach((_, chunkKey) => {
                    if (!newChunkSubs.has(chunkKey)) unsubChunks.push(chunkKey)
                });
                if (unsubChunks.length) {
                    Server.sendAction(netComponent, ActionId.UnsubscribeTerrainChunks, new UnsubscribeTerrainChunksAction(unsubChunks));
                }

                // Update chunk subscription.
                chunkSubComponent.chunks = newChunkSubs;
            }
        });

        let cumTime = 0.0;
        let startTime = clock(0);
        //if(this.chunkQueue.length) console.log(`${this.chunkQueue.length} chunks left to send / generate.`);
        while (cumTime < 2 && this.chunkQueue.length > 0) {
            let [pos, playerEntity] = this.chunkQueue.shift();
            let [cx, cy, cz] = pos;
            let key = chunkKey(cx, cy, cz);

            let chunkComponent = this.entityManager.getComponent<TerrainChunkComponent>(key, ComponentId.TerrainChunk);
            if (!chunkComponent) {
                chunkComponent = this.terrain.generateChunk(cx, cy, cz);
                this.entityManager.addComponent(key, chunkComponent);
            }

            let netComponent = this.entityManager.getComponent<NetworkComponent>(playerEntity, ComponentId.Network);
            Server.sendTerrainChunk(netComponent, chunkComponent.serialize().buffer);

            cumTime += clock(startTime) as number;
            startTime = clock(0);
        }
    }
}