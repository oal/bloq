export default function () {
    const TERRAIN_CHUNK_SIZE = 16; // Can't import "constants" here, so redefine chunk size.

    const FastSimplexNoise = require('fast-simplex-noise');

    // TODO: Alow specifying a seed, and modify these values somehow.
    let groundSampler = new FastSimplexNoise({
        min: -12,
        max: 12,
        frequency: 0.010,
        octaves: 2,
    });
    let groundDetailSampler = new FastSimplexNoise({
        frequency: 0.014,
        min: -10,
        max: 10,
    });

    let caveSampler = new FastSimplexNoise({
        frequency: 0.075,
        persistence: 0.6,
    });

    let bigCaveSampler = new FastSimplexNoise({
        frequency: 0.03,
        octaves: 2,
        persistence: 0.3,
        min: 0,
        max: 1,
    });

    let mountainSampler = new FastSimplexNoise({
        frequency: 0.0075,
        octaves: 3,
        min: -20,
        max: 5,
    });

    let bottomSampler = new FastSimplexNoise({
        frequency: 0.02,
        min: -92,
        max: -64,
    });

    let sample3d = (x: number, y: number, z: number): number => {
        if(y < bottomSampler.in2D(x, z)) return 3;

        if (caveSampler.in3D(x, y, z) + bigCaveSampler.in3D(x, y, z) - Math.max(-0.1, y/10) > 0.45 + 0.4) {
            return 0;
        }

        let groundLevel = (groundSampler.in2D(x, z) + groundDetailSampler.in3D(x, y, z));
        if(y < groundLevel + mountainSampler.in2D(x, z)) {
            return 3;
        }
        if (y < groundLevel) {
            // -5 gives us grass near the surface, and dirt on the ground in caves.
            if(y > groundLevel-5 && sample3d(x, y+1, z) === 0) return 2;

            return 1;
        }


        // Air.
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