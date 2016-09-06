import BaseWorld from "../../shared/BaseWorld";
import {registerServerComponents} from "./components";
import {
    RemoveEntitySystem, InformNewPlayersSystem, BroadcastPlayerInputSystem
} from "./systems";
import {TerrainChunkComponent} from "../../shared/components";
import {Terrain} from "./terrain";
import {TERRAIN_CHUNK_SIZE} from "../../shared/constants";

export default class World extends BaseWorld {
    terrain = new Terrain();

    constructor() {
        super();
        for (let z = -1; z <= 1; z++) {
            for (let y = -1; y <= 1; y++) {
                for (let x = -1; x <= 1; x++) {
                    let chunk = new TerrainChunkComponent(x, y, z);
                    for (let lz = 0; lz < TERRAIN_CHUNK_SIZE; lz++) {
                        for (let lx = 0; lx < TERRAIN_CHUNK_SIZE; lx++) {
                            let maxY = this.terrain.sample(x * TERRAIN_CHUNK_SIZE + lx, 0, z * TERRAIN_CHUNK_SIZE + lz) | 0;

                            for (let ly = 0; ly < maxY; ly++) {
                                chunk.setValue(lx, ly, lz, 1)
                            }

                        }

                    }

                    this.entityManager.addComponent(`${x}x${y}x${z}`, chunk);
                }
            }
        }
        registerServerComponents(this.entityManager);

        this.addSystem(new RemoveEntitySystem(this.entityManager), -10);
        this.addSystem(new InformNewPlayersSystem(this.entityManager), -9);
        this.addSystem(new BroadcastPlayerInputSystem(this.entityManager), -8);
    }


    tick(dt) {
        super.tick(dt);
    }
}