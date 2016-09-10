import {TextEncoder} from 'text-encoding';
import EntityManager from "./EntityManager";

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

    queueAction(id: number, data: Object) {
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