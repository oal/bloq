import {System} from "../../../shared/systems";
import {Terrain} from "../terrain";
import EntityManager from "../../../shared/EntityManager";
import {ComponentId, ActionId} from "../../../shared/constants";
import {ChunkSubscriptionComponent, NetworkComponent} from "../components";
import {PositionComponent, TerrainChunkComponent} from "../../../shared/components";
import {arraysEqual, chunkKey} from "../../../shared/helpers";
import Server from "../Server";
import {UnsubscribeTerrainChunksAction} from "../../../shared/actions";


export default class ChunkSubscriptionSystem extends System {
    terrain: Terrain;

    constructor(em: EntityManager, terrain: Terrain) {
        super(em);
        this.terrain = terrain;
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
                const viewDist = 3;
                for (let z = -viewDist; z <= viewDist; z++) {
                    for (let y = -viewDist; y <= viewDist; y++) {
                        for (let x = -viewDist; x <= viewDist; x++) {
                            let [cx, cy, cz] = [currChunk[0] + x, currChunk[1] + y, currChunk[2] + z];
                            let key = chunkKey(cx, cy, cz);
                            newChunkSubs.set(key, true);

                            // If this chunk key wasn't already subscribed to, player needs to receive chunk data:
                            if (!chunkSubComponent.chunks.has(key)) {
                                let chunkComponent = this.entityManager.getComponent<TerrainChunkComponent>(key, ComponentId.TerrainChunk);
                                if (!chunkComponent) {
                                    chunkComponent = this.terrain.generateChunk(cx, cy, cz);
                                    this.entityManager.addComponent(key, chunkComponent);
                                }

                                Server.sendTerrainChunk(netComponent.websocket, chunkComponent.serialize().buffer);
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
                    Server.sendAction(netComponent.websocket, ActionId.UnsubscribeTerrainChunks, new UnsubscribeTerrainChunksAction(unsubChunks));
                }

                // Update chunk subscription.
                chunkSubComponent.chunks = newChunkSubs;
            }
        })
    }
}