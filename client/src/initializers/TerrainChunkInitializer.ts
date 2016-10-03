import Initializer from "./Initializer";
import {ComponentId} from "../../../shared/constants";
import {TerrainChunkComponent} from "../../../shared/components";


export default class TerrainChunkInitializer extends Initializer {
    initialize(entity: string, components: Object) {
        let component = components[ComponentId.TerrainChunk];
        let chunkComponent = this.entityManager.addComponent(entity, component) as TerrainChunkComponent;
        chunkComponent.dirtyFields['data'] = true;
    }
}