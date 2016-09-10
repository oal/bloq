import {NetworkComponent, ChunkSubscriptionComponent} from "./components";
import {
    InputComponent, RotationComponent, PositionComponent, TerrainChunkComponent
} from "../../shared/components";
import {System} from "../../shared/systems";
import {arraysEqual, chunkKey} from "../../shared/helpers";
import Server from "./Server";
import {Terrain} from "./terrain";
import EntityManager from "../../shared/EntityManager";
import {UnsubscribeTerrainChunksAction, RemoveBlocksAction} from "../../shared/actions";


export class InformNewPlayersSystem extends System {
    update(dt: number) {
        // Will ~99.999% only ever be one new player per tick.
        let syncComponents = ['position', 'rotation', 'physics', 'input', 'player'];

        this.entityManager.getEntities('newplayer').forEach((component, newEntity) => {
            let newPlayerData = this.entityManager.serializeEntity(newEntity, syncComponents);
            let existingPlayerDatas = [];

            // Send info about new player to existing players.
            this.entityManager.getEntities('player').forEach((component, existingEntity) => {
                if (existingEntity == newEntity) return; // Never send info about the new player to themselves.
                let ws = this.entityManager.getComponent(existingEntity, 'network') as NetworkComponent;
                Server.sendEntity(ws.websocket, newPlayerData);

                existingPlayerDatas.push(this.entityManager.serializeEntity(existingEntity, syncComponents));
            });

            // Inform new player about existing players.
            let ws = this.entityManager.getComponent(newEntity, 'network') as NetworkComponent;
            existingPlayerDatas.forEach(data => {
                Server.sendEntity(ws.websocket, data);
            });

            console.log('New player informed.');
            this.entityManager.removeComponent(newEntity, component);
        });
    }
}

export class BroadcastPlayerInputSystem extends System {
    update(dt: number) {
        let changedInputs = new Map();
        this.entityManager.getEntities('input').forEach((component, entity) => {
            let inputComponent = component as InputComponent;
            if (inputComponent.isDirty()) {
                changedInputs.set(entity, inputComponent.serialize());
                inputComponent.setDirty(false);
            }
        });

        let changedRots = new Map();
        this.entityManager.getEntities('rotation').forEach((component, entity) => {
            let rot = component as RotationComponent;
            if (rot.isDirty()) {
                changedRots.set(entity, rot.serialize());
                rot.setDirty(false);
            }
        });

        if (changedInputs.size > 0) {
            this.entityManager.getEntities('network').forEach((component, entity) => {
                let netComponent = component as NetworkComponent;
                changedInputs.forEach((serializedInputs, changedEntity) => {
                    if (changedEntity === entity) return;
                    Server.sendEntity(netComponent.websocket, `{"entity":"${changedEntity}","components":{"input":${serializedInputs}}}`);
                });
            })
        }

        if (changedRots.size > 0) {
            this.entityManager.getEntities('network').forEach((component, entity) => {
                let netComponent = component as NetworkComponent;
                changedRots.forEach((serializedRot, changedEntity) => {
                    if (changedEntity === entity) return;
                    Server.sendEntity(netComponent.websocket, `{"entity":"${changedEntity}","components":{"rotation":${serializedRot}}}`)
                })
            })
        }
    }
}

export class RemoveEntitySystem extends System {
    update(dt: number) {
        this.entityManager.getEntities('removedentity').forEach((component, entity) => {
            let data = this.entityManager.serializeEntity(entity, ['removedentity']);
            this.entityManager.removeEntity(entity);
            this.entityManager.getEntities('player').forEach((component, entity) => {
                let netComponent = this.entityManager.getComponent(entity, 'network') as NetworkComponent;
                Server.sendEntity(netComponent.websocket, data);
            });
        })
    }
}

export class ChunkSubscriptionSystem extends System {
    terrain: Terrain;

    constructor(em: EntityManager, terrain: Terrain) {
        super(em);
        this.terrain = terrain;
    }

    update(dt: number) {
        this.entityManager.getEntities('chunksubscription').forEach((component, entity) => {
            let chunkSubComponent = component as ChunkSubscriptionComponent;
            let posComponent = this.entityManager.getComponent(entity, 'position') as PositionComponent;
            let netComponent = this.entityManager.getComponent(entity, 'network') as NetworkComponent;

            // Do we need to update chunk subscriptions?
            let currChunk = posComponent.toChunk();
            if (!arraysEqual(currChunk, chunkSubComponent.inChunk)) {
                let newChunkSubs = new Map<string, boolean>();
                chunkSubComponent.inChunk = currChunk;

                // Look through the view area for the player and notify of new chunks in view.
                const viewDist = 2;
                for (let z = -viewDist; z <= viewDist; z++) {
                    for (let y = -viewDist; y <= viewDist; y++) {
                        for (let x = -viewDist; x <= viewDist; x++) {
                            let [cx, cy, cz] = [currChunk[0] + x, currChunk[1] + y, currChunk[2] + z];
                            let key = chunkKey(cx, cy, cz);
                            newChunkSubs.set(key, true);

                            // If this chunk key wasn't already subscribed to, player needs to receive chunk data:
                            if (!chunkSubComponent.chunks.has(key)) {
                                let chunkComponent = this.entityManager.getComponent(key, 'terrainchunk') as TerrainChunkComponent;
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
                    Server.sendAction(netComponent.websocket, new UnsubscribeTerrainChunksAction(unsubChunks));
                }

                // Update chunk subscription.
                chunkSubComponent.chunks = newChunkSubs;
                chunkSubComponent.setDirty(true);
            }
        })
    }
}

export class PlayerActionSystem extends System {
    update(dt: number): any {
        this.entityManager.getEntities('input').forEach((component, entity) => {
            let inputComponent = component as InputComponent;
            // TODO: Broadcast instead of just sending back to the player owning this input component.
            let netComponent = this.entityManager.getComponent(entity, 'network') as NetworkComponent;
            if (inputComponent.primaryAction) {
                Server.sendAction(netComponent.websocket, new RemoveBlocksAction([inputComponent.actionTarget]));
            }
        })
    }
}