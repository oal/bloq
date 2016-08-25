import {Component} from "./components";

export default class EntityManager {
    components: Map<string, Map<string, Component>>;

    constructor() {
        this.components = new Map<string, Map<string, Component>>();
    }

    removeEntity(entity: string) {
        this.components.forEach((entities, type) => {
            if(entities[entity]) this.removeComponentType(entity, type);
        });
    }

    setComponent(entity: string, component: Component) {
        this.components[component.typeName()][entity] = component;
    }

    removeComponentType(entity: string, type: string) {
        delete this.components[type][entity];
    }

    removeComponent(entity, component: Component) {
        delete this.components[component.typeName()][entity]
    }
}