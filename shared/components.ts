import EntityManager from "./EntityManager";
export class Component {
    typeName(): string {
        let fullName = (this.constructor as any).name.toLowerCase();
        return fullName.substring(0, fullName.length-9); // Everything except "Component".
    }

    serialize() {
        return JSON.stringify(this);
    }

    // Pretty much full / partial deserialization, but JSON is already deserialized in entity deserializer.
    update(data: Object) {
        for(let key in data) {
            if(!data.hasOwnProperty(key)) continue;

            this[key] = data[key];
        }
    }

    dispose(): void {}
}

export class PositionComponent extends Component {
    x: number = 0;
    y: number = 0;
    z: number = 0;
}

export class PhysicsComponent extends Component {}

export function registerSharedComponents(manager: EntityManager) {
    manager.registerComponentType(new PositionComponent());
    manager.registerComponentType(new PhysicsComponent());
}