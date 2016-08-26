import {Component} from "./components";

export default class EntityManager {
    private components: Map<string, Map<string, Component>>;

    constructor() {
        this.components = new Map<string, Map<string, Component>>();
    }

    serializeEntity(entity: string) {
        let obj = {
            entity: entity,
            components: {}
        };

        this.components.forEach((entities, type) => {
            let component = entities.get(entity);
            if(component) obj['components'][type] = component;
        });

        return JSON.stringify(obj);
    }

    removeEntity(entity: string) {
        this.components.forEach((entities, type) => {
            if(entities.has(entity)) this.removeComponentType(entity, type);
        });
    }

    addComponent(entity: string, component: Component) {
        let typeName = component.typeName();
        if(!this.components.get(typeName)) {
            this.components.set(typeName, new Map<string, Component>());
        }

        this.components.get(typeName).set(entity, component);
    }

    removeComponentType(entity: string, type: string) {
        let componentEntities = this.components.get(type);
        let component = componentEntities.get(entity);
        if(component) {
            component.dispose(); // Hook into component in case it needs to do some cleanup.
            componentEntities.delete(entity);
        }
    }

    removeComponent(entity, component: Component) {
        this.removeComponentType(entity, component.typeName());
    }
}