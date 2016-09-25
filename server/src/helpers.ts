import {chunkKey} from "../../shared/helpers";
import EntityManager from "../../shared/EntityManager";
import {Action, RemoveEntitiesAction} from "../../shared/actions";
import Server from "./Server";
import {NetworkComponent, ChunkSubscriptionComponent} from "./components";
import {ComponentId, ActionId} from "../../shared/constants";


export function broadcastAction(em: EntityManager, chunk: [number, number, number], actionId: ActionId, action: Action) {
    let key = chunkKey(chunk[0], chunk[1], chunk[2]);

    em.getEntities(ComponentId.ChunkSubscription).forEach((component, entity) => {
        // If we are going to remove an entity, and this entity a networked entity (Player),
        // it means this player has disconnected, so no need to try sending on a closed socket.
        if(actionId === ActionId.RemoveEntities && (action as RemoveEntitiesAction).entities.indexOf(entity) !== -1) return;

        let subComponent = component as ChunkSubscriptionComponent;
        if(subComponent.chunks.has(key)) {
            let netComponent = em.getComponent<NetworkComponent>(entity, ComponentId.Network);
            Server.sendAction(netComponent.websocket, actionId, action);
        }
    });
}

export function broadcastEntity(em: EntityManager, chunk: [number, number, number], blockEntity: string) {
    let key = chunkKey(chunk[0], chunk[1], chunk[2]);

    em.getEntities(ComponentId.ChunkSubscription).forEach((component, entity) => {
        let subComponent = component as ChunkSubscriptionComponent;

        if(subComponent.chunks.has(key)) {
            let netComponent = em.getComponent<NetworkComponent>(entity, ComponentId.Network);
            Server.sendEntity(netComponent.websocket, em.serializeEntity(blockEntity));
        }
    });
}