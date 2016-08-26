import {Component} from "./components";

export default class EntityManager {
    private components: Map<string, Map<string, Component>>;
    private componentConstructors: Map<string, Function>;

    constructor() {
        this.components = new Map<string, Map<string, Component>>();
        this.componentConstructors = new Map<string, Function>();
    }

    registerComponentType(instance: Component) {
        let type = instance.typeName();
        if(this.componentConstructors.has(type)) {
            console.warn(`Component type "${type} already registered.`);
            return;
        }

        this.componentConstructors.set(type, instance.constructor);
        this.components.set(type, new Map<string, Component>());
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

    // TODO: WIP, might not work properly.
    deserializeAndSetEntity(json: string) {
        let obj = JSON.parse(json);
        let entity = obj['entity'];
        let components = obj['components'];

        components.forEach((data, type) => {
            let constructor = this.componentConstructors.get(type);
            let instance = new constructor();
            instance.update(data);
        })
    }

    removeEntity(entity: string) {
        this.components.forEach((entities, type) => {
            if(entities.has(entity)) this.removeComponentType(entity, type);
        });
    }

    addComponent(entity: string, component: Component) {
        let typeName = component.typeName();
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