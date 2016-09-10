import {Component, SerializableComponent} from "./components";

export default class EntityManager {
    private components: Map<string, Map<string, Component>>;
    private componentConstructors: Map<string, Function>;

    constructor() {
        this.components = new Map<string, Map<string, Component>>();
        this.componentConstructors = new Map<string, Function>();
    }

    registerComponentType(instance: Component) {
        let type = instance.typeName();
        if (this.componentConstructors.has(type)) {
            console.warn(`Component type "${type} already registered.`);
            return;
        }
        this.componentConstructors.set(type, instance.constructor);
        this.components.set(type, new Map<string, Component>());
    }

    getRegisteredComponentTypes(): Iterator<string> {
        return this.componentConstructors.keys();
    }

    serializeEntity(entity: string, withComponents: Array<string> = null) {
        // Each component needs to be serialized individually, then a JSON string is manually created.
        // Just using JSON.stringify would cause each component's serialized string to be escaped.

        if (!withComponents) withComponents = Array.from(this.componentConstructors.keys());

        let components = [];
        withComponents.forEach(typeName => {
            let component = this.components.get(typeName).get(entity);
            if (component instanceof SerializableComponent) {
                components.push(`"${typeName}":${component.serialize()}`);
            } else if (!component) {
                console.error(`Tried to serialize ${component}`)
            } else {
                console.warn(`Tried to serialize non-serializeable component: "${component.typeName()}"`)
            }
        });

        return `{"entity":"${entity}","components":{${components.join(',')}}}`;
    }

    deserializeAndSetEntity(json: string) {
        let obj = JSON.parse(json);

        // Extract entity UUID and component data.
        let entity = obj['entity'];
        let components = obj['components'];

        // Loop over and construct new instances of components.
        for (let type in components) {
            if (!components.hasOwnProperty(type)) continue;

            let data = components[type];
            let constructor = this.componentConstructors.get(type);
            if(!constructor) {
                console.error('Tried to deserialize unknown component:', type);
                continue;
            }

            let instance = new (constructor as any)();
            instance.update(data);

            // Finally, add / set component in entity manager.
            this.addComponent(entity, instance);
        }
    }

    removeEntity(entity: string) {
        this.components.forEach((entities, type) => {
            if (entities.has(entity)) this.removeComponentType(entity, type);
        });
    }

    getEntities(componentType: string): Map<string, Component> {
        return this.components.get(componentType);
    }

    getComponent(entity: string, componentType: string): Component {
        return this.components.get(componentType).get(entity);
    }

    addComponent(entity: string, component: Component): Component {
        let typeName = component.typeName();
        this.components.get(typeName).set(entity, component);

        return component;
    }

    removeComponentType(entity: string, type: string) {
        let componentEntities = this.components.get(type);
        let component = componentEntities.get(entity);
        if (component) {
            component.dispose(); // Hook into component in case it needs to do some cleanup.
            componentEntities.delete(entity);
        }
    }

    removeComponent(entity, component: Component) {
        this.removeComponentType(entity, component.typeName());
    }
}