import {Component} from "../../shared/components";
import EntityManager from "../../shared/EntityManager";

export class NetworkComponent extends Component {
    websocket: WebSocket;
}

export class NewPlayerComponent extends Component {

}

export function registerServerComponents(manager: EntityManager) {
    manager.registerComponentType(new NetworkComponent());
    manager.registerComponentType(new NewPlayerComponent());
}