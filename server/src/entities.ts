import EntityManager from "../../shared/EntityManager";
import {InputComponent, PositionComponent, YawComponent, PlayerComponent} from "../../shared/components";
import {NetworkComponent, NewPlayerComponent} from "./components";


export function initPlayerEntity(em: EntityManager, entity: string, ws: WebSocket) {
    let net = new NetworkComponent();
    net.websocket = ws;
    em.addComponent(entity, net); // Keyboard input
    em.addComponent(entity, new InputComponent()); // Keyboard input
    em.addComponent(entity, new PositionComponent()); // Position tracking
    em.addComponent(entity, new YawComponent()); // Rotation

    em.addComponent(entity, new PlayerComponent()); // Treat as player / render as player? WIP
    em.addComponent(entity, new NewPlayerComponent()); // Deleted as soon as all players have been informed of this new player
}