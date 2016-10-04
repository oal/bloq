import FastSimplexNoise = require('fast-simplex-noise');
import {TerrainChunkComponent} from "../../shared/components";
import {TERRAIN_CHUNK_SIZE, ComponentId} from "../../shared/constants";
import EntityManager from "../../shared/EntityManager";
import {globalToChunk, chunkKey, mod} from "../../shared/helpers";

export class Terrain {
    groundSampler = new FastSimplexNoise({
        min: -12,
        max: 12,
        frequency: 0.008,
    });
    groundDetailSampler = new FastSimplexNoise({
        min: -2,
        max: 2,
        frequency: 0.04,
    });

    caveSampler = new FastSimplexNoise({
        frequency: 0.03,
    });

    mountainSampler = new FastSimplexNoise({
        frequency: 0.01,
        min: -48,
        max: 24,
    });

    sample2d(x: number, y: number, z: number): number {
        if (this.caveSampler.in3D(x, y, z)-(y/50) > 0.7) {
            return 0;
        }

        if(this.mountainSampler.in2D(x, z) > y) {
            return 3;
        }

        let groundLevel = this.groundSampler.in2D(x, z) + this.groundDetailSampler.in2D(x, z);
        if (groundLevel - 1 > y) {
            return 1;
        } else if (groundLevel > y) {
            return 2;
        }

        return 0;
    }

    generateChunk(x: number, y: number, z: number): TerrainChunkComponent {
        console.time(`genchunk-${x}-${y}-${z}`);
        let chunk = new TerrainChunkComponent(x, y, z);
        for (let lz = 0; lz < TERRAIN_CHUNK_SIZE; lz++) {
            for (let ly = 0; ly < TERRAIN_CHUNK_SIZE; ly++) {
                for (let lx = 0; lx < TERRAIN_CHUNK_SIZE; lx++) {
                    chunk.setValue(lx, ly, lz, this.sample2d(x * TERRAIN_CHUNK_SIZE + lx, y * TERRAIN_CHUNK_SIZE + ly, z * TERRAIN_CHUNK_SIZE + lz));
                }
            }
        }
        console.time(`genchunk-${x}-${y}-${z}`);
        return chunk;
    }
}

export function getValueGlobal(em: EntityManager, x: number, y: number, z: number) {
    let key = chunkKey(globalToChunk(x), globalToChunk(y), globalToChunk(z));
    let chunkComponent = em.getComponent<TerrainChunkComponent>(key, ComponentId.TerrainChunk);

    return chunkComponent.getValue(mod(x, TERRAIN_CHUNK_SIZE), mod(y, TERRAIN_CHUNK_SIZE), mod(z, TERRAIN_CHUNK_SIZE));
}