var Worker = require("tiny-worker");
import {System} from "../../../shared/System";
import EntityManager from "../../../shared/EntityManager";
import {ComponentId, ActionId} from "../../../shared/constants";
import {ChunkSubscriptionComponent, NetworkComponent} from "../components";
import {PositionComponent, TerrainChunkComponent} from "../../../shared/components";
import {arraysEqual, chunkKey} from "../../../shared/helpers";
import Server from "../Server";
import {UnsubscribeTerrainChunksAction} from "../../../shared/actions";
import TerrainWorker from "../workers/TerrainWorker";


export default class ChunkSubscriptionSystem extends System {
    worker: Worker = new Worker(TerrainWorker);
    chunkQueue: Map<string, Set<string>> = new Map<string, Set<string>>();

    constructor(em: EntityManager) {
        super(em);

        this.worker.onmessage = (evt) => {
            let entity = chunkKey(evt.data.x, evt.data.y, evt.data.z);
            let chunkComponent = new TerrainChunkComponent(evt.data.x, evt.data.y, evt.data.z);
            chunkComponent.data = Uint8Array.from(evt.data.data); // Serialized as Array in JSON, but needs to be Uint8.
            this.entityManager.addComponent(entity, chunkComponent);
        }
    }

    private queueChunkFor(x: number, y: number, z: number, entity: string) {
        let key = chunkKey(x, y, z);
        let set = this.chunkQueue.get(key);
        if (!set) {
            set = new Set<string>();
            this.chunkQueue.set(key, set);

            if (!this.entityManager.hasComponent(key, ComponentId.TerrainChunk)) {
                this.worker.postMessage({x, y, z});
            }
        }
        set.add(entity);
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

        this.chunkQueue.forEach((playerSet, key) => {
            let chunkComponent = this.entityManager.getComponent<TerrainChunkComponent>(key, ComponentId.TerrainChunk);
            if (chunkComponent) {
                playerSet.forEach(playerEntity => {
                    // TODO: Add "bytesLeft" that returns how much space is left in network buffer.
                    // And don't send everything at once.
                    let netComponent = this.entityManager.getComponent<NetworkComponent>(playerEntity, ComponentId.Network);
                    Server.sendTerrainChunk(netComponent, chunkComponent.serialize().buffer);
                });
                this.chunkQueue.delete(key);
            }
        });
    }
}