import {
    ActionManager, UnsubscribeTerrainChunksAction, SetBlocksAction,
    RemoveEntitiesAction, MoveEntityAction
} from "../../shared/actions";


export class ClientActionManager extends ActionManager {
    queueRawAction(id: number, data: Object) {
        switch(id) {
            case UnsubscribeTerrainChunksAction.ID:
                this.queue.push(new UnsubscribeTerrainChunksAction(data['chunkKeys']));
                break;
            case SetBlocksAction.ID:
                let blocks = data['blocks'].map(block => [block[0], block[1], block[2], block[3]]);
                console.log(blocks)
                this.queue.push(new SetBlocksAction(blocks));
                break;
            case RemoveEntitiesAction.ID:
                this.queue.push(new RemoveEntitiesAction(data['entities']));
                break;
            case MoveEntityAction.ID:
                this.queue.push(new MoveEntityAction(data['entity'], data['position'].map(num => parseFloat(num))));
                break;
            default:
                console.warn('Unknown action ID: ', id);
                return;
        }
    }
}