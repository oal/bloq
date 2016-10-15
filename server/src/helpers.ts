import EntityManager from "../../shared/EntityManager";
import {Action, RemoveEntitiesAction} from "../../shared/actions";
import Server from "./Server";
import {NetworkComponent} from "./components";
import {ComponentId, ActionId} from "../../shared/constants";


export function broadcastAction(em: EntityManager, chunk: [number, number, number], actionId: ActionId, action: Action) {
    em.getEntities(ComponentId.Network).forEach((component, playerEntity) => {
        // If we are going to remove an entity, and this entity a networked entity (Player),
        // it means this player has disconnected, so no need to try sending on a closed socket.
        if (actionId === ActionId.RemoveEntities && (action as RemoveEntitiesAction).entities.indexOf(playerEntity) !== -1) return;

        let netComponent = component as NetworkComponent;
        Server.sendAction(netComponent, actionId, action);
    });
}

export function broadcastEntity(em: EntityManager, chunk: [number, number, number], entity: string) {
    em.getEntities(ComponentId.Network).forEach((component, playerEntity) => {
        let netComponent = component as NetworkComponent;
        Server.sendEntity(netComponent, em.serializeEntity(entity));
    });
}