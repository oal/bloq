import {System} from "../../../shared/System";
import {ComponentId, ViewDistance} from "../../../shared/constants";
import {PositionComponent, ChunkRequestComponent} from "../../../shared/components";
import {chunkKey} from "../../../shared/helpers";
import {PlayerChunkComponent} from "../components";
import NetworkSystem from "./NetworkSystem";
import EntityManager from "../../../shared/EntityManager";


export default class ChunkSystem extends System {
    netSystem: NetworkSystem;

    constructor(em: EntityManager, netSystem: NetworkSystem) {
        super(em);
        this.netSystem = netSystem;
    }

    update(dt: number): void {
        let [entity, chunkComponent] = this.entityManager.getFirstEntity<PlayerChunkComponent>(ComponentId.PlayerChunk);
        if(!entity) return;

        let posComponent = this.entityManager.getComponent<PositionComponent>(entity, ComponentId.Position);

        let [cx, cy, cz] = posComponent.toChunk();
        if (cx === chunkComponent.x && cy === chunkComponent.y && cz === chunkComponent.z) return;
        chunkComponent.x = cx;
        chunkComponent.y = cy;
        chunkComponent.z = cz;

        let requestChunks = new ChunkRequestComponent();
        for (let dist = 0; dist <= ViewDistance; dist++) {
            for (let z = -ViewDistance; z <= ViewDistance; z++) {
                for (let y = -Math.round(ViewDistance / 2); y <= Math.round(ViewDistance / 2); y++) {
                    for (let x = -ViewDistance; x <= ViewDistance; x++) {
                        let realDist = Math.sqrt(x * x + y * y + z * z);
                        if (realDist < dist || realDist > dist + 1) continue;

                        let [cx, cy, cz] = [chunkComponent.x + x, chunkComponent.y + y, chunkComponent.z + z];
                        let key = chunkKey(cx, cy, cz);
                        if (!this.entityManager.hasComponent(key, ComponentId.TerrainChunk)) {
                            requestChunks.chunks.push(key);
                        }
                    }
                }
            }
        }

        this.entityManager.addComponent(entity, requestChunks);
        this.netSystem.pushBuffer(this.entityManager.serializeEntity(entity, [ComponentId.ChunkRequest]));
        this.entityManager.removeComponent(entity, requestChunks);
    }
}