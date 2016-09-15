import {
    ActionManager, UnsubscribeTerrainChunksAction, RemoveBlocksAction,
    RemoveEntitiesAction, MoveEntityAction
} from "../../shared/actions";


export class ClientActionManager extends ActionManager {
    queueRawAction(id: number, data: Object) {
        switch(id) {
            case UnsubscribeTerrainChunksAction.ID:
                this.queue.push(new UnsubscribeTerrainChunksAction(data['chunkKeys']));
                break;
            case RemoveBlocksAction.ID:
                let blocks = data['blocks'].map(coord => [coord[0], coord[1], coord[2]]);
                this.queue.push(new RemoveBlocksAction(blocks));
                break;
            case RemoveEntitiesAction.ID:
                this.queue.push(new RemoveBlocksAction(data['entities']));
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