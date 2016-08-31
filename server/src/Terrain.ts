import {TERRAIN_CHUNK_SIZE} from "../../client/src/constants";
import {SerializableComponent} from "../../shared/components";


let chunkKey = (x: number, y: number, z: number) => `${x}x${y}x${z}`;


export class Terrain {
    private chunks: Map<string, TerrainChunk> = new Map<string, TerrainChunk>();

    getChunk(x: number, y: number, z: number): TerrainChunk {
        let chunk = this.chunks.get(chunkKey(x, y, z));
        if (chunk) return chunk;

        let newChunk = new TerrainChunk();
        this.setChunk(x, y, z, newChunk);
        return this.chunks.get(chunkKey(x, y, z))
    }

    private setChunk(x: number, y: number, z: number, chunk: TerrainChunk) {
        this.chunks.set(chunkKey(x, y, z), chunk)
    }
}

class TerrainChunk extends SerializableComponent {
    data: Uint8Array = new Uint8Array(TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE);

    constructor() {
        super();

        for (let x = 0; x < TERRAIN_CHUNK_SIZE; x++) {
            for (let z = 0; z < TERRAIN_CHUNK_SIZE; z++) {
                this.setValue(x, 0, z, 1)
            }
        }
    }

    setValue(x: number, y: number, z: number, mat: number): boolean {
        if (x < 0 || y < 0 || z < 0 || x >= TERRAIN_CHUNK_SIZE || y >= TERRAIN_CHUNK_SIZE || z >= TERRAIN_CHUNK_SIZE) return false;
        this.data[y * TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE + z * TERRAIN_CHUNK_SIZE + x] = mat;
    }
}