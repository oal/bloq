import {TextEncoder} from 'text-encoding';
import EntityManager from "./EntityManager";
import {globalToChunk, mod, chunkKey} from "./helpers";
import {TERRAIN_CHUNK_SIZE, ComponentId} from "./constants";
import {TerrainChunkComponent, PositionComponent} from "./components";
import {MeshComponent} from "../client/src/components";


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

            let entityKey = chunkKey(cx, cy, cz);
            let chunk = entityManager.getComponent(entityKey, ComponentId.TerrainChunk) as TerrainChunkComponent;
            if (!chunk || chunk.getValue(lx, ly, lz) === 0) return;

            // Force refresh for neighboring chunks if player is digging at the edge of this chunk.
            [-1, 0, 1].forEach(oz => {
                [-1, 0, 1].forEach(oy => {
                    [-1, 0, 1].forEach(ox => {
                        if(Math.abs(ox) + Math.abs(oy) + Math.abs(oz) !== 1) return;
                        let [nx, ny, nz] = [x + ox, y + oy, z + oz].map(globalToChunk);
                        let neighborKey = chunkKey(nx, ny, nz);
                        if (neighborKey === entityKey) return;

                        let neighborChunk = entityManager.getComponent(neighborKey, ComponentId.TerrainChunk) as TerrainChunkComponent;
                        if (neighborChunk) {
                            console.log('Force neighbor dirty', neighborKey);
                            neighborChunk.forceDirtyData(true);
                        }
                    });
                });
            });


            console.log('GLOBAL dig', x, y, z);
            console.log('LOCAL dig', lx, ly, lz, 'in', cx, cy, cz);
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
