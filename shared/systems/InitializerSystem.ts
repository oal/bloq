import {ComponentId} from "../constants";
import {System} from "../System";
import Initializer from "../Initializer";
import EntityManager from "../EntityManager";
import {EntityMessage} from "../interfaces";
import {ComponentEventEmitter} from "../EventEmitter";


export default class InitializerSystem extends System {
    private componentQueue: Map<ComponentId, Array<Object>> = new Map<ComponentId, Array<EntityMessage>>();
    private initializers: Map<ComponentId, Initializer> = new Map<ComponentId, Initializer>();
    private eventEmitter: ComponentEventEmitter;

    constructor(em: EntityManager, eventManager: ComponentEventEmitter) {
        super(em);
        this.eventEmitter = eventManager;
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

        this.eventEmitter.addEventListener(componentId, (entity, components) => {
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