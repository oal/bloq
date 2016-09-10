import {chunkKey} from "../../shared/helpers";
import EntityManager from "../../shared/EntityManager";
import {Action} from "../../shared/actions";
import Server from "./Server";
import {NetworkComponent, ChunkSubscriptionComponent} from "./components";


export function broadcastAction(em: EntityManager, chunk: [number, number, number], action: Action) {
    let key = chunkKey(chunk[0], chunk[1], chunk[2]);

    em.getEntities('chunksubscription').forEach((component, entity) => {
        let subComponent = component as ChunkSubscriptionComponent;

        if(subComponent.chunks.has(key)) {
            let netComponent = em.getComponent(entity, 'network') as NetworkComponent;
            Server.sendAction(netComponent.websocket, action);
        }
    });
}