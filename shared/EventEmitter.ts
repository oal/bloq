import {ComponentId} from "./constants";

export interface ComponentListenerFunc {
    (entity: string, components: Object): void;
}

export class ComponentEventEmitter {
    private componentHandlers: Map<ComponentId, Array<Function>> = new Map<ComponentId, Array<Function>>();

    addEventListener(componentId: ComponentId, listener: ComponentListenerFunc) {
        let handlers = this.componentHandlers.get(componentId);
        if (!handlers) {
            handlers = [];
            this.componentHandlers.set(componentId, handlers);
        }
        handlers.push(listener);
    }

    emit(componentId: ComponentId, entity: string, components: Object) {
        let handlers = this.componentHandlers.get(componentId);
        if (!handlers) return;

        handlers.forEach((callback) => {
            callback(entity, components);
        })
    }
}