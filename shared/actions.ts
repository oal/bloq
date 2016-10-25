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
        //if (this.queue.length) console.log(`Processed ${this.queue.length} actions.`);

        this.queue = [];
    }

    queueRawAction(id: number, data: Object) {
    }

    queueAction(action: Action) {
        this.queue.push(action);
    }
}

export class Action {
    serialize(): ArrayBuffer {
        let str = JSON.stringify(this);
        let encoder = new TextEncoder();
        return encoder.encode(str).buffer;
    }

    execute(entityManager: EntityManager) {
    }
}


export class UnsubscribeTerrainChunksAction extends Action {
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

export class SetBlocksAction extends Action {
    blocks: Array<[number, number, number, number]>;

    constructor(blocks: Array<[number, number, number, number]>) {
        super();
        this.blocks = blocks;
    }

    execute(entityManager: EntityManager) {
        this.blocks.forEach(block => {
            let [x, y, z, value] = block;

            let [cx, cy, cz] = [x, y, z].map(globalToChunk);
            let [lx, ly, lz] = [mod(x, TERRAIN_CHUNK_SIZE), mod(y, TERRAIN_CHUNK_SIZE), mod(z, TERRAIN_CHUNK_SIZE)];

            let entityKey = chunkKey(cx, cy, cz);
            let chunk = entityManager.getComponent<TerrainChunkComponent>(entityKey, ComponentId.TerrainChunk);
            if (!chunk) return;

            // Force refresh for neighboring chunks if player is digging at the edge of this chunk.
            [-1, 0, 1].forEach(oz => {
                [-1, 0, 1].forEach(oy => {
                    [-1, 0, 1].forEach(ox => {
                        if (Math.abs(ox) + Math.abs(oy) + Math.abs(oz) !== 1) return;
                        let [nx, ny, nz] = [x + ox, y + oy, z + oz].map(globalToChunk);
                        let neighborKey = chunkKey(nx, ny, nz);
                        if (neighborKey === entityKey) return;

                        let neighborChunk = entityManager.getComponent<TerrainChunkComponent>(neighborKey, ComponentId.TerrainChunk);
                        if (neighborChunk) neighborChunk.forceDirtyData(true);
                    });
                });
            });

            chunk.setValue(lx, ly, lz, value);
        })
    }
}

export class RemoveEntitiesAction extends Action {
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
    entity: string;
    position: [number, number, number];

    constructor(entity: string, position: [number, number, number]) {
        super();
        this.entity = entity;
        this.position = position;
    }

    execute(entityManager: EntityManager) {
        let posComponent = entityManager.getComponent<PositionComponent>(this.entity, ComponentId.Position);
        posComponent.x = this.position[0];
        posComponent.y = this.position[1];
        posComponent.z = this.position[2];
    }
}

export class PickUpEntityAction extends Action {
    player: string; // entity
    inventorySlot: number; // inventory slot to place entity in.
    pickable: string; // entity

    constructor(playerEntity: string, inventorySlot: number, pickableEntity: string) {
        super();
        this.player = playerEntity;
        this.inventorySlot = inventorySlot;
        this.pickable = pickableEntity;
    }
}