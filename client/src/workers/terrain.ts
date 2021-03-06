import {TERRAIN_CHUNK_SIZE} from "../../../shared/constants";

// Relative offsets for cube faces. See more details further down.
const faces = [
    // +z
    [
        -1, -1, 1,
        1, -1, 1,
        1, 1, 1,

        1, 1, 1,
        -1, 1, 1,
        -1, -1, 1
    ],
    // -z
    [
        -1, -1, -1,
        1, 1, -1,
        1, -1, -1,

        1, 1, -1,
        -1, -1, -1,
        -1, 1, -1
    ],
    // +y
    [
        -1, 1, -1,
        1, 1, 1,
        1, 1, -1,

        1, 1, 1,
        -1, 1, -1,
        -1, 1, 1
    ],
    // -y
    [
        -1, -1, -1,
        1, -1, -1,
        1, -1, 1,

        1, -1, 1,
        -1, -1, 1,
        -1, -1, -1
    ],
    // +x
    [
        1, -1, -1,
        1, 1, -1,
        1, 1, 1,

        1, 1, 1,
        1, -1, 1,
        1, -1, -1
    ],
    // -x
    [
        -1, -1, -1,
        -1, 1, 1,
        -1, 1, -1,

        -1, 1, 1,
        -1, -1, -1,
        -1, -1, 1
    ]
];

const size = TERRAIN_CHUNK_SIZE; // Save some typing.


function buildChunkArrays(data: Uint8Array, neighbors: Array<Array<Array<Uint8Array>>>) {
    // Indexes to keep track of how full the buffers are / where to insert / slice.
    let vertIdx = 0;
    let triIdx = 0;
    let shadowIdx = 0;

    // Buffers for geometry data. Should be enough room. Gets sliced before returning.
    let materials = new Float32Array(size * size * size * 8);
    let vertices = new Float32Array(size * size * size * 16);
    let shadows = new Float32Array(size * size * size * 8);

    // Yes, it's massive. Could probably use hard coded indices like 1 and 15, as we will be doing 17-16 etc
    // a lot here. But I'm not sure if I'll need more flexibility later, so for now I'll keep it.
    let getPoint = (x, y, z) => {
        if (x < 0) {
            if (y < 0) {
                if (z < 0) {
                    let chunk = neighbors[0][0][0];
                    if (!chunk) return 0;
                    return chunk[(y + size) * size * size + (z + size) * size + (x + size)];
                } else if (z >= size) {
                    let chunk = neighbors[2][0][0];
                    if (!chunk) return 0;
                    return chunk[(y + size) * size * size + (z - size) * size + (x + size)];
                } else {
                    let chunk = neighbors[1][0][0];
                    if (!chunk) return 0;
                    return chunk[(y + size) * size * size + z * size + (x + size)];
                }
            } else if (y >= size) {
                if (z < 0) {
                    let chunk = neighbors[0][2][0];
                    if (!chunk) return 0;
                    return chunk[(y - size) * size * size + (z + size) * size + (x + size)];
                } else if (z >= size) {
                    let chunk = neighbors[2][2][0];
                    if (!chunk) return 0;
                    return chunk[(y - size) * size * size + (z - size) * size + (x + size)];
                } else {
                    let chunk = neighbors[1][2][0];
                    if (!chunk) return 0;
                    return chunk[(y - size) * size * size + z * size + (x + size)];
                }
            } else {
                if (z < 0) {
                    let chunk = neighbors[0][1][0];
                    if (!chunk) return 0;
                    return chunk[y * size * size + (z + size) * size + (x + size)];
                } else if (z >= size) {
                    let chunk = neighbors[2][1][0];
                    if (!chunk) return 0;
                    return chunk[y * size * size + (z - size) * size + (x + size)];
                } else {
                    let chunk = neighbors[1][1][0];
                    if (!chunk) return 0;
                    return chunk[y * size * size + z * size + (x + size)];
                }
            }
        } else if (x >= size) {
            if (y < 0) {
                if (z < 0) {
                    let chunk = neighbors[0][0][2];
                    if (!chunk) return 0;
                    return chunk[(y + size) * size * size + (z + size) * size + (x - size)];
                } else if (z >= size) {
                    let chunk = neighbors[2][0][2];
                    if (!chunk) return 0;
                    return chunk[(y + size) * size * size + (z - size) * size + (x - size)];
                } else {
                    let chunk = neighbors[1][0][2];
                    if (!chunk) return 0;
                    return chunk[(y + size) * size * size + z * size + (x - size)];
                }
            } else if (y >= size) {
                if (z < 0) {
                    let chunk = neighbors[0][2][2];
                    if (!chunk) return 0;
                    return chunk[(y - size) * size * size + (z + size) * size + (x - size)];
                } else if (z >= size) {
                    let chunk = neighbors[2][2][2];
                    if (!chunk) return 0;
                    return chunk[(y - size) * size * size + (z - size) * size + (x - size)];
                } else {
                    let chunk = neighbors[1][2][2];
                    if (!chunk) return 0;
                    return chunk[(y - size) * size * size + z * size + (x - size)];
                }
            } else {
                if (z < 0) {
                    let chunk = neighbors[0][1][2];
                    if (!chunk) return 0;
                    return chunk[y * size * size + (z + size) * size + (x - size)];
                } else if (z >= size) {
                    let chunk = neighbors[2][1][2];
                    if (!chunk) return 0;
                    return chunk[y * size * size + (z - size) * size + (x - size)];
                } else {
                    let chunk = neighbors[1][1][2];
                    if (!chunk) return 0;
                    return chunk[y * size * size + z * size + (x - size)];
                }
            }
        } else {
            if (y < 0) {
                if (z < 0) {
                    let chunk = neighbors[0][0][1];
                    if (!chunk) return 0;
                    return chunk[(y + size) * size * size + (z + size) * size + x];
                } else if (z >= size) {
                    let chunk = neighbors[2][0][1];
                    if (!chunk) return 0;
                    return chunk[(y + size) * size * size + (z - size) * size + x];
                } else {
                    let chunk = neighbors[1][0][1];
                    if (!chunk) return 0;
                    return chunk[(y + size) * size * size + z * size + x];
                }
            } else if (y >= size) {
                if (z < 0) {
                    let chunk = neighbors[0][2][1];
                    if (!chunk) return 0;
                    return chunk[(y - size) * size * size + (z + size) * size + x];
                } else if (z >= size) {
                    let chunk = neighbors[2][2][1];
                    if (!chunk) return 0;
                    return chunk[(y - size) * size * size + (z - size) * size + x];
                } else {
                    let chunk = neighbors[1][2][1];
                    if (!chunk) return 0;
                    return chunk[(y - size) * size * size + z * size + x];
                }
            } else {
                if (z < 0) {
                    let chunk = neighbors[0][1][1];
                    if (!chunk) return 0;
                    return chunk[y * size * size + (z + size) * size + x];
                } else if (z >= size) {
                    let chunk = neighbors[2][1][1];
                    if (!chunk) return 0;
                    return chunk[y * size * size + (z - size) * size + x];
                } // else case would be default behavior, so it's the last line of this function.
            }
        }

        return data[y * size * size + z * size + x];
    };

    // Helper used to increase indices, and set values for vertices, material and color (shadow).
    let addVertex = (x: number, y: number, z: number, val: number, shadow: boolean = false) => {
        vertices[vertIdx++] = x;
        vertices[vertIdx++] = y;
        vertices[vertIdx++] = z;

        materials[triIdx++] = val;
        shadows[shadowIdx++] = shadow ? 0.75 : 1.0;
    };

    let sideMaterials = [0, 1, 11, 3, 4, 5, 6, 7, 12, 9, 10];
    let transparentMaterials = new Set([0, 7, 9]);

    // Low level, and kind of ugly, but it should not need to be changed very often.
    for (let z = 0; z < size; z++) {
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                let material = getPoint(x, y, z);
                if (material) {
                    // Insert faces where an actual value (like dirt) meets air/empty block.
                    // Use relative indexes from "faces", and get nearby blocks to check if they
                    // should be shadowed or not.
                    let nextMaterial: number;

                    // North
                    nextMaterial = getPoint(x, y, z + 1);
                    if (transparentMaterials.has(nextMaterial) && nextMaterial !== material) {
                        let face = faces[0];
                        for (let f = 0; f < 18; f += 3) {
                            addVertex(
                                x + face[f] / 2, y + face[f + 1] / 2, z + face[f + 2] / 2, sideMaterials[material],
                                !!getPoint(x + face[f], y + face[f + 1], z + face[f + 2]) || !!getPoint(x, y + face[f + 1], z + face[f + 2]) || !!getPoint(x + face[f], y, z + face[f + 2])
                            );
                        }
                    }

                    // South
                    nextMaterial = getPoint(x, y, z - 1);
                    if (transparentMaterials.has(nextMaterial) && nextMaterial !== material) {
                        let face = faces[1];
                        for (let f = 0; f < 18; f += 3) {
                            addVertex(
                                x + face[f] / 2, y + face[f + 1] / 2, z + face[f + 2] / 2, sideMaterials[material],
                                !!getPoint(x + face[f], y + face[f + 1], z + face[f + 2]) || !!getPoint(x, y + face[f + 1], z + face[f + 2]) || !!getPoint(x + face[f], y, z + face[f + 2])
                            );
                        }
                    }

                    // Up
                    nextMaterial = getPoint(x, y + 1, z);
                    if (transparentMaterials.has(nextMaterial) && nextMaterial !== material) {
                        let face = faces[2];
                        for (let f = 0; f < 18; f += 3) {
                            addVertex(
                                x + face[f] / 2, y + face[f + 1] / 2, z + face[f + 2] / 2, material,
                                !!getPoint(x + face[f], y + face[f + 1], z + face[f + 2]) || !!getPoint(x, y + face[f + 1], z + face[f + 2]) || !!getPoint(x + face[f], y + face[f + 1], z)
                            );
                        }
                    }

                    // Down
                    nextMaterial = getPoint(x, y - 1, z);
                    if (transparentMaterials.has(nextMaterial) && nextMaterial !== material) {
                        let face = faces[3];
                        for (let f = 0; f < 18; f += 3) {
                            addVertex(
                                x + face[f] / 2, y + face[f + 1] / 2, z + face[f + 2] / 2, material,
                                !!getPoint(x + face[f], y + face[f + 1], z + face[f + 2]) || !!getPoint(x, y + face[f + 1], z + face[f + 2]) || !!getPoint(x + face[f], y + face[f + 1], z)
                            );
                        }
                    }

                    // East
                    nextMaterial = getPoint(x + 1, y, z);
                    if (transparentMaterials.has(nextMaterial) && nextMaterial !== material) {
                        let face = faces[4];
                        for (let f = 0; f < 18; f += 3) {
                            addVertex(
                                x + face[f] / 2, y + face[f + 1] / 2, z + face[f + 2] / 2, sideMaterials[material],
                                !!getPoint(x + face[f], y + face[f + 1], z + face[f + 2]) || !!getPoint(x + face[f], y, z + face[f + 2]) || !!getPoint(x + face[f], y + face[f + 1], z)
                            );
                        }
                    }

                    // West
                    nextMaterial = getPoint(x - 1, y, z);
                    if (transparentMaterials.has(nextMaterial) && nextMaterial !== material) {
                        let face = faces[5];
                        for (let f = 0; f < 18; f += 3) {
                            addVertex(
                                x + face[f] / 2, y + face[f + 1] / 2, z + face[f + 2] / 2, sideMaterials[material],
                                !!getPoint(x + face[f], y + face[f + 1], z + face[f + 2]) || !!getPoint(x + face[f], y, z + face[f + 2]) || !!getPoint(x + face[f], y + face[f + 1], z)
                            );
                        }
                    }
                }
            }
        }
    }

    return {
        materials: materials.slice(0, triIdx),
        vertices: vertices.slice(0, vertIdx),
        shadows: shadows.slice(0, shadowIdx)
    }
}

onmessage = (e: MessageEvent) => {
    let chunkArrays = buildChunkArrays(e.data.data, e.data.neighborData);
    if (!chunkArrays) return;

    postMessage({
        entity: e.data.entity,
        arrays: chunkArrays
    });
};