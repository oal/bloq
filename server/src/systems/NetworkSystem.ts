import {System} from "../../../shared/System";
import Server from "../Server";
import EntityManager from "../../../shared/EntityManager";
import {ComponentId} from "../../../shared/constants";
import {NetworkComponent} from "../components";


export default class NetworkSystem extends System {
    server: Server;

    constructor(em: EntityManager, server: Server) {
        super(em);
        this.server = server;
    }

    update(dt: number): void {
        this.entityManager.getEntities(ComponentId.Network).forEach((component, entity) => {
            let netComponent = component as NetworkComponent;

            // Player has disconnected. Remove entity and do not attempt to send on socket.
            if(netComponent.websocket.readyState == netComponent.websocket.CLOSED) {
                this.entityManager.removeEntity(entity);
                return;
            }

            // Nothing in buffer to send
            if(netComponent.bufferPos === 0) return;

            netComponent.websocket.send(netComponent.buffer.slice(0, netComponent.bufferPos));
            netComponent.bufferPos = 0;
        });
    }
}