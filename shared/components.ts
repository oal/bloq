import EntityManager from "./EntityManager";
import {TERRAIN_CHUNK_SIZE} from "./constants";
import {globalToChunk} from "./helpers";

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

    toChunk(): [number, number, number] {
        return [globalToChunk(this.x), globalToChunk(this.y), globalToChunk(this.z)]
    }
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


export class TerrainChunkComponent extends Component {
    x: number;
    y: number;
    z: number;
    data: Uint8Array = new Uint8Array(TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE);

    constructor(x?: number, y?: number, z?: number) {
        super();

        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    getValue(x: number, y: number, z: number) {
        if (x < 0 || y < 0 || z < 0 || x >= TERRAIN_CHUNK_SIZE || y >= TERRAIN_CHUNK_SIZE || z >= TERRAIN_CHUNK_SIZE) return 0;
        return this.data[(y|0) * TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE + (z|0) * TERRAIN_CHUNK_SIZE + (x|0)];
    }

    setValue(x: number, y: number, z: number, mat: number): boolean {
        if (x < 0 || y < 0 || z < 0 || x >= TERRAIN_CHUNK_SIZE || y >= TERRAIN_CHUNK_SIZE || z >= TERRAIN_CHUNK_SIZE) return false;
        this.data[(y|0) * TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE + (z|0) * TERRAIN_CHUNK_SIZE + (x|0)] = mat;
    }

    serialize(): Uint8Array {
        // Copy chunk data at an offset of 3 Int32 (chunk coordinates).
        let arr = new Uint8Array(Int32Array.BYTES_PER_ELEMENT * 3 + this.data.length);
        arr.set(this.data, Int32Array.BYTES_PER_ELEMENT * 3);

        // Set three Int32 for chunk coordinates at the beginning of the underlying buffer.
        let coordView = new DataView(arr.buffer);
        coordView.setInt32(0, this.x);
        coordView.setInt32(Int32Array.BYTES_PER_ELEMENT, this.y);
        coordView.setInt32(Int32Array.BYTES_PER_ELEMENT*2, this.z);

        // Return as buffer for Node to transfer it correctly.
        return arr;
    }
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
    manager.registerComponentType(new TerrainChunkComponent());
}