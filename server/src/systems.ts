import {NetworkComponent, ChunkSubscriptionComponent} from "./components";
import {
    InputComponent, RotationComponent, PositionComponent, TerrainChunkComponent
} from "../../shared/components";
import {System} from "../../shared/systems";
import {arraysEqual, chunkKey, globalToChunk} from "../../shared/helpers";
import Server from "./Server";
import {Terrain} from "./terrain";
import EntityManager from "../../shared/EntityManager";
import {UnsubscribeTerrainChunksAction, RemoveBlocksAction} from "../../shared/actions";
import {broadcastAction} from "./helpers";
import {ComponentId} from "../../shared/constants";
import {ServerActionManager} from "./actions";


export class InformNewPlayersSystem extends System {
    update(dt: number) {
        // Will ~99.999% only ever be one new player per tick.
        let syncComponents = [
            ComponentId.Position,
            ComponentId.Rotation,
            ComponentId.Physics,
            ComponentId.Input,
            ComponentId.Player
        ];

        this.entityManager.getEntities(ComponentId.NewPlayer).forEach((component, newEntity) => {
            let newPlayerData = this.entityManager.serializeEntity(newEntity, syncComponents);
            let existingPlayerDatas = [];

            // Send info about new player to existing players.
            this.entityManager.getEntities(ComponentId.Player).forEach((component, existingEntity) => {
                if (existingEntity == newEntity) return; // Never send info about the new player to themselves.
                let ws = this.entityManager.getComponent(existingEntity, ComponentId.Network) as NetworkComponent;
                Server.sendEntity(ws.websocket, newPlayerData);

                existingPlayerDatas.push(this.entityManager.serializeEntity(existingEntity, syncComponents));
            });

            // Inform new player about existing players.
            let ws = this.entityManager.getComponent(newEntity, ComponentId.Network) as NetworkComponent;
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
        this.entityManager.getEntities(ComponentId.Input).forEach((component, entity) => {
            let inputComponent = component as InputComponent;
            if (inputComponent.isDirty()) {
                changedInputs.set(entity, inputComponent.serialize());
            }
        });

        let changedRots = new Map();
        this.entityManager.getEntities(ComponentId.Rotation).forEach((component, entity) => {
            let rot = component as RotationComponent;
            if (rot.isDirty()) {
                changedRots.set(entity, rot.serialize());
            }
        });

        if (changedInputs.size > 0) {
            this.entityManager.getEntities(ComponentId.Network).forEach((component, entity) => {
                let netComponent = component as NetworkComponent;
                changedInputs.forEach((serializedInputs, changedEntity) => {
                    if (changedEntity === entity) return;
                    Server.sendEntity(netComponent.websocket, `{"entity":"${changedEntity}","components":{"${ComponentId.Input}":${serializedInputs}}}`);
                });
            })
        }

        if (changedRots.size > 0) {
            this.entityManager.getEntities(ComponentId.Network).forEach((component, entity) => {
                let netComponent = component as NetworkComponent;
                changedRots.forEach((serializedRot, changedEntity) => {
                    if (changedEntity === entity) return;
                    Server.sendEntity(netComponent.websocket, `{"entity":"${changedEntity}","components":{"${ComponentId.Rotation}":${serializedRot}}}`)
                })
            })
        }
    }
}

export class ChunkSubscriptionSystem extends System {
    terrain: Terrain;

    constructor(em: EntityManager, terrain: Terrain) {
        super(em);
        this.terrain = terrain;
    }

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.ChunkSubscription).forEach((component, entity) => {
            let chunkSubComponent = component as ChunkSubscriptionComponent;
            let posComponent = this.entityManager.getComponent(entity, ComponentId.Position) as PositionComponent;
            let netComponent = this.entityManager.getComponent(entity, ComponentId.Network) as NetworkComponent;

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
                                let chunkComponent = this.entityManager.getComponent(key, ComponentId.TerrainChunk) as TerrainChunkComponent;
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
            }
        })
    }
}

export class PlayerActionSystem extends System {
    actionManager: ServerActionManager;

    constructor(entityManager: EntityManager, actionManager: ServerActionManager) {
        super(entityManager);
        this.actionManager = actionManager;
    }

    update(dt: number): any {
        this.entityManager.getEntities(ComponentId.Input).forEach((component, entity) => {
            let inputComponent = component as InputComponent;

            if (inputComponent.primaryAction) {
                let action = new RemoveBlocksAction([inputComponent.actionTarget]);

                this.actionManager.queueAction(action); // Queue on server as well.

                // Broad cast so it's queued on clients.
                let [cx, cy, cz] = inputComponent.actionTarget.map(globalToChunk);
                broadcastAction(this.entityManager, [cx, cy, cz], action);
            }
        });
    }
}