import {TERRAIN_CHUNK_SIZE} from "../../client/src/constants";
import {SerializableComponent} from "../../shared/components";


let chunkKey = (x: number, y: number, z: number) => `${x}x${y}x${z}`;


export class Terrain {
    private chunks: Map<string, TerrainChunk> = new Map<string, TerrainChunk>();

    getChunk(x: number, y: number, z: number): TerrainChunk {
        let chunk = this.chunks.get(chunkKey(x, y, z));
        if (chunk) return chunk;

        let newChunk = new TerrainChunk(x, y, z);
        this.setChunk(x, y, z, newChunk);
        return this.chunks.get(chunkKey(x, y, z))
    }

    private setChunk(x: number, y: number, z: number, chunk: TerrainChunk) {
        this.chunks.set(chunkKey(x, y, z), chunk)
    }
}

class TerrainChunk {
    x: number = 0;
    y: number = 0;
    z: number = 0;

    data: Uint8Array = new Uint8Array(TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE);

    constructor(x: number, y: number, z: number) {
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

    serialize(): Buffer {
        // Copy chunk data at an offset of 3 Int32 (chunk coordinates).
        let arr = new Uint8Array(Int32Array.BYTES_PER_ELEMENT * 3 + this.data.length);
        arr.set(this.data, Int32Array.BYTES_PER_ELEMENT * 3);

        // Set three Int32 for chunk coordinates at the beginning of the underlying buffer.
        let coordView = new DataView(arr.buffer);
        coordView.setInt32(0, this.x);
        coordView.setInt32(Int32Array.BYTES_PER_ELEMENT, this.y);
        coordView.setInt32(Int32Array.BYTES_PER_ELEMENT*2, this.z);

        // Return as buffer for Node to transfer it correctly.
        return new Buffer(arr);
    }
}