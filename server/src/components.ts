import {Component, SerializableComponent} from "../../shared/components";
import EntityManager from "../../shared/EntityManager";
import {ComponentId} from "../../shared/constants";

export class NetworkComponent extends Component {
    static ID = ComponentId.Network;

    websocket: WebSocket;
}

export class ChunkSubscriptionComponent extends Component {
    static ID = ComponentId.ChunkSubscription;

    inChunk: [number, number, number];
    chunks: Map<string, boolean> = new Map<string, boolean>();
}

export class NewPlayerComponent extends Component {
    static ID = ComponentId.NewPlayer;
}

// A similar, but more full featured component is used on client. Same name, different implementation (for storing player mesh etc)
export class PlayerComponent extends SerializableComponent {
    static ID = ComponentId.Player;
}

export class PickableComponent extends SerializableComponent {
    static ID = ComponentId.Pickable;
}

export function registerServerComponents(manager: EntityManager) {
    manager.registerComponentType(new NetworkComponent());
    manager.registerComponentType(new ChunkSubscriptionComponent());
    manager.registerComponentType(new NewPlayerComponent());
    manager.registerComponentType(new PlayerComponent());
    manager.registerComponentType(new PickableComponent());
}