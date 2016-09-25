import {
    ActionManager, UnsubscribeTerrainChunksAction, SetBlocksAction,
    RemoveEntitiesAction, MoveEntityAction
} from "../../shared/actions";
import {ActionId} from "../../shared/constants";


export class ClientActionManager extends ActionManager {
    queueRawAction(id: number, data: Object) {
        switch(id) {
            case ActionId.UnsubscribeTerrainChunks:
                this.queue.push(new UnsubscribeTerrainChunksAction(data['chunkKeys']));
                break;
            case ActionId.SetBlocks:
                let blocks = data['blocks'].map(block => [block[0], block[1], block[2], block[3]]);
                this.queue.push(new SetBlocksAction(blocks));
                break;
            case ActionId.RemoveEntities:
                this.queue.push(new RemoveEntitiesAction(data['entities']));
                break;
            case ActionId.MoveEntity:
                this.queue.push(new MoveEntityAction(data['entity'], data['position'].map(num => parseFloat(num))));
                break;
            default:
                console.warn('Unknown action ID: ', id);
                return;
        }
    }
}