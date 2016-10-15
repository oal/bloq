import Initializer from "../../../shared/Initializer";
import {ComponentId} from "../../../shared/constants";
import {ChunkRequestComponent} from "../../../shared/components";


export default class ChunkRequestInitializer extends Initializer {
    initialize(entity: string, components: Object): void {
        let requestData = components[ComponentId.ChunkRequest];
        let existingRequest = this.entityManager.getComponent<ChunkRequestComponent>(entity, ComponentId.ChunkRequest);

        // TODO: Might want to use Set.
        requestData.chunks.forEach(key => {
            if(existingRequest.chunks.indexOf(key) === -1) existingRequest.chunks.push(key);
        });
    }
}