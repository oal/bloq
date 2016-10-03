import {System} from "../../../shared/systems";
import {ComponentId} from "../../../shared/constants";
import Initializer from "../initializers/Initializer";
import EntityManager from "../../../shared/EntityManager";
import {Server} from "../Server";


export default class ServerEntitySystem extends System {
    private componentQueue: Map<ComponentId, Array<Object>> = new Map<ComponentId, Array<Object>>();
    private initializers: Map<ComponentId, Initializer> = new Map<ComponentId, Initializer>();
    private serverConn: Server;

    constructor(em: EntityManager, server: Server) {
        super(em);
        this.serverConn = server;
    }

    update(dt: number) {

    }

    addInitializer(componentId: ComponentId, initializer: Initializer) {
        this.initializers.set(componentId, initializer);

        // TODO: Queue in system instead of calling directly:
        this.serverConn.addEventListener(componentId, (entity, components) => initializer.initialize(entity, components));
    }
}