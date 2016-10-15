export default function () {
    const TERRAIN_CHUNK_SIZE = 16; // Can't import "constants" here, so redefine chunk size.

    const FastSimplexNoise = require('fast-simplex-noise');

    // TODO: Alow specifying a seed, and modify these values somehow.
    let groundSampler = new FastSimplexNoise({
        min: -12,
        max: 12,
        frequency: 0.008,
    });
    let groundDetailSampler = new FastSimplexNoise({
        min: -2,
        max: 2,
        frequency: 0.04,
    });

    let caveSampler = new FastSimplexNoise({
        frequency: 0.03,
    });

    let mountainSampler = new FastSimplexNoise({
        frequency: 0.01,
        min: -48,
        max: 24,
    });

    let sample3d = (x: number, y: number, z: number): number => {
        if (caveSampler.in3D(x, y, z) - (y / 50) > 0.7) {
            return 0;
        }

        if (mountainSampler.in2D(x, z) > y) {
            return 3;
        }

        let groundLevel = groundSampler.in2D(x, z) + groundDetailSampler.in2D(x, z);
        if (groundLevel - 1 > y) {
            return 1;
        } else if (groundLevel > y) {
            return 2;
        }

        return 0;
    };

    onmessage = (e: MessageEvent) => {
        let {x, y, z} = e.data;

        let data = new Uint8Array(TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE);
        for (let lz = 0; lz < TERRAIN_CHUNK_SIZE; lz++) {
            for (let ly = 0; ly < TERRAIN_CHUNK_SIZE; ly++) {
                for (let lx = 0; lx < TERRAIN_CHUNK_SIZE; lx++) {
                    data[ly * TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE + lz * TERRAIN_CHUNK_SIZE + lx] = sample3d(x * TERRAIN_CHUNK_SIZE + lx, y * TERRAIN_CHUNK_SIZE + ly, z * TERRAIN_CHUNK_SIZE + lz);
                }
            }
        }

        postMessage({
            x: x,
            y: y,
            z: z,
            data: Array.from(data) // Convert to normal array so it isn't serialized to a JSON object.
        });
    };
}