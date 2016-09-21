import FastSimplexNoise = require('fast-simplex-noise');
import {TerrainChunkComponent} from "../../shared/components";
import {TERRAIN_CHUNK_SIZE} from "../../shared/constants";

export class Terrain {
    sampler: FastSimplexNoise = new FastSimplexNoise();

    sample2d(x: number, y: number, z: number) {
        return this.sampler.in2D(x / 50, z / 50) * 8 + 8;
    }

    generateChunk(x: number, y: number, z: number): TerrainChunkComponent {
        let chunk = new TerrainChunkComponent(x, y, z);
        for (let lz = 0; lz < TERRAIN_CHUNK_SIZE; lz++) {
            for (let lx = 0; lx < TERRAIN_CHUNK_SIZE; lx++) {
                let maxY = (this.sample2d(x * TERRAIN_CHUNK_SIZE + lx, 0, z * TERRAIN_CHUNK_SIZE + lz) | 0) - y * TERRAIN_CHUNK_SIZE;
                let max = Math.min(maxY, TERRAIN_CHUNK_SIZE);
                for (let ly = 0; ly < max; ly++) {
                    if(ly !== max-1) chunk.setValue(lx, ly, lz, 1);
                    else chunk.setValue(lx, ly, lz, 2);
                }
            }
        }

        for (let lz = 0; lz < TERRAIN_CHUNK_SIZE; lz++) {
            for (let lx = 0; lx < TERRAIN_CHUNK_SIZE; lx++) {
                let maxY = (this.sample2d(3452345345+x * TERRAIN_CHUNK_SIZE + lx, 0, z * TERRAIN_CHUNK_SIZE + lz) | 0) - y * TERRAIN_CHUNK_SIZE;
                let max = Math.min(maxY, TERRAIN_CHUNK_SIZE);
                for (let ly = 0; ly < max; ly++) {
                    chunk.setValue(lx, ly, lz, 3);
                }
            }
        }

        return chunk;
    }
}