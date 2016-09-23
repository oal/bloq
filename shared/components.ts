import EntityManager from "./EntityManager";
import {TERRAIN_CHUNK_SIZE, ComponentId, Side} from "./constants";
import {globalToChunk} from "./helpers";

// Used when serializing component to avoid "dirty" flag being serialized. It is only needed locally at runtime.
let componentReplacer = (key, value) => {
    if (key === 'dirtyFields') return undefined;
    return value;
};

export class Component {
    static ID = 0;
    dirtyFields: {} = {}; // TODO: Use Set if we can compile without it being transpiled to an Object.

    get ID(): number {
        return this.constructor['ID'];
    }

    isDirty(field?: string): boolean {
        if(field) return !!this.dirtyFields[field];
        else return Object.keys(this.dirtyFields).some(key => this.dirtyFields[key]);
    }

    typeName(): ComponentId {
        return this.ID;
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
    static ID = ComponentId.Position;

    x: number = 0;
    y: number = 0;
    z: number = 0;

    toChunk(): [number, number, number] {
        return [globalToChunk(this.x), globalToChunk(this.y), globalToChunk(this.z)]
    }
}

export class RotationComponent extends SerializableComponent {
    static ID = ComponentId.Rotation;

    x: number = 0.0;
    y: number = 0.0;
    z: number = 0.0;
}

export class PhysicsComponent extends SerializableComponent {
    static ID = ComponentId.Physics;

    velX: number = 0;
    velY: number = 0;
    velZ: number = 0;
}

export class OnGroundComponent extends Component {
    static ID = ComponentId.OnGround;

    canJump: boolean = true;
}

// TODO: Use setters or something for these values, and use on server as well.
export class WallCollisionComponent extends Component {
    static ID = ComponentId.WallCollision;

    public px: boolean = false;
    public pz: boolean = false;
    public nx: boolean = false;
    public nz: boolean = false;
}

export class InputComponent extends SerializableComponent {
    static ID = ComponentId.Input;

    moveForward: boolean = false;
    moveLeft: boolean = false;
    moveRight: boolean = false;
    moveBackward: boolean = false;
    jump: boolean = false;

    primaryAction: boolean = false; // Left mouse button
    secondaryAction: boolean = false; // Right mouse button
    target: [number, number, number] = [0, 0, 0]; // Where in space the action is performed.
    targetSide: Side = null;
}



export class CurrentPlayerComponent extends SerializableComponent {
    static ID = ComponentId.CurrentPlayer;
}

export class TerrainChunkComponent extends Component {
    static ID = ComponentId.TerrainChunk;

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

    // Used when block just next to this chunk is changed, to force refresh of this chunk's mesh.
    forceDirtyData(state: boolean) {
        this.dirtyFields['data'] = state;
    }

    getValue(x: number, y: number, z: number) {
        if (x < 0 || y < 0 || z < 0 || x >= TERRAIN_CHUNK_SIZE || y >= TERRAIN_CHUNK_SIZE || z >= TERRAIN_CHUNK_SIZE) return 0;
        return this.data[(y|0) * TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE + (z|0) * TERRAIN_CHUNK_SIZE + (x|0)];
    }

    setValue(x: number, y: number, z: number, mat: number): boolean {
        if (x < 0 || y < 0 || z < 0 || x >= TERRAIN_CHUNK_SIZE || y >= TERRAIN_CHUNK_SIZE || z >= TERRAIN_CHUNK_SIZE) return false;
        this.data[(y|0) * TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE + (z|0) * TERRAIN_CHUNK_SIZE + (x|0)] = mat;

        // Implicit dirty detection only works when setting attributes, not mutating child structures like an array.
        this.dirtyFields['data'] = true;
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
    manager.registerComponentType(new WallCollisionComponent());
    manager.registerComponentType(new TerrainChunkComponent());
}