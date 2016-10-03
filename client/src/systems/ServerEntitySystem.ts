import {System} from "../../../shared/systems";
import {ComponentId} from "../../../shared/constants";
import Initializer from "../initializers/Initializer";
import EntityManager from "../../../shared/EntityManager";
import {Server, EntityMessage} from "../Server";


export default class ServerEntitySystem extends System {
    private componentQueue: Map<ComponentId, Array<Object>> = new Map<ComponentId, Array<EntityMessage>>();
    private initializers: Map<ComponentId, Initializer> = new Map<ComponentId, Initializer>();
    private serverConn: Server;

    constructor(em: EntityManager, server: Server) {
        super(em);
        this.serverConn = server;
    }

    update(dt: number) {
        this.componentQueue.forEach((messages: Array<EntityMessage>, componentType: ComponentId) => {
            let initializer = this.initializers.get(componentType);
            messages.forEach(entityMessage => {
                initializer.initialize(entityMessage.entity, entityMessage.components);
            });
        });

        this.componentQueue.clear();
    }

    addInitializer(componentId: ComponentId, initializer: Initializer) {
        this.initializers.set(componentId, initializer);

        this.serverConn.addEventListener(componentId, (entity, components) => {
            let compQueue = this.componentQueue.get(componentId);
            if (!compQueue) {
                compQueue = [];
                this.componentQueue.set(componentId, compQueue)
            }

            compQueue.push({
                entity: entity,
                components: components
            })
        });
    }
}