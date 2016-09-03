import {Component, SerializableComponent} from "../../shared/components";
import EntityManager from "../../shared/EntityManager";

export class NetworkComponent extends Component {
    websocket: WebSocket;
}

export class NewPlayerComponent extends Component {

}

// A similar, but more full featured component is used on client. Same name, different implementation (for storing player mesh etc)
export class PlayerComponent extends SerializableComponent {
}

export function registerServerComponents(manager: EntityManager) {
    manager.registerComponentType(new NetworkComponent());
    manager.registerComponentType(new NewPlayerComponent());
    manager.registerComponentType(new PlayerComponent());
}