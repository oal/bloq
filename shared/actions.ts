import {TextEncoder} from 'text-encoding';
import EntityManager from "./EntityManager";
import {globalToChunk, mod, chunkKey} from "./helpers";
import {TERRAIN_CHUNK_SIZE, ComponentId} from "./constants";
import {TerrainChunkComponent, PositionComponent} from "./components";

export class ActionManager {
    queue: Array<Action> = [];

    executeAll(entityManager: EntityManager) {
        this.queue.forEach(action => {
            action.execute(entityManager);
        });
        // For debugging:
        if (this.queue.length) console.log(`Processed ${this.queue.length} actions.`);

        this.queue = [];
    }

    queueRawAction(id: number, data: Object) {
    }

    queueAction(action: Action) {
        this.queue.push(action);
    }
}

export class Action {
    static ID: number = 0;

    get ID(): number {
        return this.constructor['ID'];
    }

    serialize(): Uint8Array {
        let str = JSON.stringify(this);
        let encoder = new TextEncoder();
        return encoder.encode(str);
    }

    execute(entityManager: EntityManager) {
    }
}


export class UnsubscribeTerrainChunksAction extends Action {
    static ID: number = 1;
    chunkKeys: Array<string> = [];

    constructor(chunkKeys: Array<string>) {
        super();
        this.chunkKeys = chunkKeys;
    }

    execute(entityManager: EntityManager) {
        for (let chunkKey of this.chunkKeys) {
            entityManager.removeEntity(chunkKey);
        }
    }
}

export class RemoveBlocksAction extends Action {
    static ID: number = 2;
    blocks: Array<[number, number, number]>;

    constructor(blocks: Array<[number, number, number]>) {
        super();
        this.blocks = blocks;
    }

    execute(entityManager: EntityManager) {
        this.blocks.forEach(coord => {
            let [x, y, z] = coord;
            let [cx, cy, cz] = coord.map(globalToChunk);
            let [lx, ly, lz] = [mod(x, TERRAIN_CHUNK_SIZE), mod(y, TERRAIN_CHUNK_SIZE), mod(z, TERRAIN_CHUNK_SIZE)];

            let chunk = entityManager.getComponent(chunkKey(cx, cy, cz), ComponentId.TerrainChunk) as TerrainChunkComponent;
            if(!chunk) return;

            chunk.setValue(lx, ly, lz, 0);
        })
    }
}

export class RemoveEntitiesAction extends Action {
    static ID: number = 3;
    entities: Array<string>;

    constructor(entities: Array<string>) {
        super();
        this.entities = entities;
    }

    execute(entityManager: EntityManager) {
        for (let entity of this.entities) {
            entityManager.removeEntity(entity);
        }
    }
}


export class MoveEntityAction extends Action {
    static ID: number = 4;

    entity: string;
    position: [number, number, number];

    constructor(entity: string, position: [number, number, number]) {
        super();
        this.entity = entity;
        this.position = position;
    }

    execute(entityManager: EntityManager) {
        let posComponent = entityManager.getComponent(this.entity, ComponentId.Position) as PositionComponent;
        posComponent.x = this.position[0];
        posComponent.y = this.position[1];
        posComponent.z = this.position[2];
    }
}
