import EntityManager from "./EntityManager";

// Used when serializing component to avoid "dirty" flag being serialized. It is only needed locally at runtime.
let componentReplacer = (key, value) => {
    if (key === 'dirty') return undefined;
    return value;
};

export class Component {
    private dirty: boolean = false;

    setDirty(state: boolean) {
        this.dirty = state;
    }

    isDirty(): boolean {
        return this.dirty;
    }

    typeName(): string {
        let fullName = (this.constructor as any).name.toLowerCase();
        return fullName.substring(0, fullName.length - 9); // Everything except "Component".
    }

    // Pretty much full / partial deserialization, but JSON is already deserialized in entity deserializer.
    update(data: Object) {
        for (let key in data) {
            if (!data.hasOwnProperty(key)) continue;

            this[key] = data[key];
        }
    }

    dispose(): void {
    }
}

export class SerializableComponent extends Component {
    serialize() {
        return JSON.stringify(this, componentReplacer);
    }
}

export class PositionComponent extends SerializableComponent {
    x: number = 0;
    y: number = 0;
    z: number = 0;
}

export class RotationComponent extends SerializableComponent {
    x: number = 0.0;
    y: number = 0.0;
    z: number = 0.0;
}

export class PhysicsComponent extends SerializableComponent {
    velX: number = 0;
    velY: number = 0;
    velZ: number = 0;
}

export class OnGroundComponent extends Component {
}

// TODO: Use setters or something for these values, and use on server as well.
export class WallCollisionComponent extends Component {
    public px: boolean = false;
    public pz: boolean = false;
    public nx: boolean = false;
    public nz: boolean = false;
}

export class InputComponent extends SerializableComponent {
    moveForward: boolean = false;
    moveLeft: boolean = false;
    moveRight: boolean = false;
    moveBackward: boolean = false;
    jump: boolean = false;
}



export class CurrentPlayerComponent extends SerializableComponent {
}


export class RemovedEntityComponent extends SerializableComponent {
}

export function registerSharedComponents(manager: EntityManager) {
    manager.registerComponentType(new PositionComponent());
    manager.registerComponentType(new RotationComponent());
    manager.registerComponentType(new PhysicsComponent());
    manager.registerComponentType(new OnGroundComponent());
    manager.registerComponentType(new InputComponent());
    manager.registerComponentType(new CurrentPlayerComponent());
    manager.registerComponentType(new RemovedEntityComponent());
    manager.registerComponentType(new WallCollisionComponent());
}