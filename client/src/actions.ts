import {ActionManager, UnsubscribeTerrainChunksAction} from "../../shared/actions";


export class ClientActionManager extends ActionManager {
    queueAction(id: number, data: Object) {
        switch(id) {
            case UnsubscribeTerrainChunksAction.ID:
                this.queue.push(new UnsubscribeTerrainChunksAction(data['chunkKeys']));
                break;
            default:
                console.warn('Unknown action ID: ', id);
                return;
        }
    }
}