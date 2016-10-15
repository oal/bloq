import {NetworkComponent} from "../components";
var Worker = require("tiny-worker");
var now = require('performance-now');
import {System} from "../../../shared/System";
import EntityManager from "../../../shared/EntityManager";
import {ComponentId, TERRAIN_CHUNK_SIZE} from "../../../shared/constants";
import {TerrainChunkComponent, ChunkRequestComponent} from "../../../shared/components";
import {chunkKey} from "../../../shared/helpers";
import Server from "../Server";
import TerrainWorker from "../workers/TerrainWorker";


export default class ChunkRequestSystem extends System {
    worker: Worker = new Worker(TerrainWorker);
    chunkQueue: Map<string, Set<string>> = new Map<string, Set<string>>();

    chunksRequested: Set<string> = new Set<string>();

    constructor(em: EntityManager) {
        super(em);

        this.worker.onmessage = (evt) => {
            let entity = chunkKey(evt.data.x, evt.data.y, evt.data.z);
            let chunkComponent = new TerrainChunkComponent(evt.data.x, evt.data.y, evt.data.z);
            chunkComponent.data = Uint8Array.from(evt.data.data); // Serialized as Array in JSON, but needs to be Uint8.
            this.entityManager.addComponent(entity, chunkComponent);
        }
    }

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.ChunkRequest).forEach((component, entity) => {
            let reqComponent = component as ChunkRequestComponent;
            let netComponent = this.entityManager.getComponent<NetworkComponent>(entity, ComponentId.Network);

            reqComponent.chunks.some(key => {
                let chunkComponent = this.entityManager.getComponent<TerrainChunkComponent>(key, ComponentId.TerrainChunk);
                if (chunkComponent) {
                    Server.sendTerrainChunk(netComponent, chunkComponent.serialize().buffer);
                    reqComponent.chunks.splice(reqComponent.chunks.indexOf(key), 1);
                    return netComponent.bytesLeft() < Math.pow(TERRAIN_CHUNK_SIZE, 3) + 32
                }

                if (!this.chunksRequested.has(key)) {
                    this.chunksRequested.add(key);
                    let [x, y, z] = key.split('x').map(i => parseInt(i));
                    this.worker.postMessage({x, y, z});
                }

                return false;
            });
        });
    }
}