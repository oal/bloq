import {BufferAttribute, BufferGeometry} from 'three';
import {TERRAIN_CHUNK_SIZE} from "../../shared/constants";

const size = TERRAIN_CHUNK_SIZE;

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

let buildChunkArrays = (data: Uint8Array, neighbors: Array<Array<Array<Uint8Array>>>) => {
    let i = 0;
    let tri = 0;
    let color = 0;

    let mats = new Float32Array(size * size * size * 8);
    let verts = new Float32Array(size * size * size * 16);
    let colors = new Float32Array(size * size * size * 16);

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

    let addVertex = (x: number, y: number, z: number, val: number, shadow: boolean = false) => {
        verts[i++] = x;
        verts[i++] = y;
        verts[i++] = z;
        mats[tri++] = val;

        let shadowVal = shadow ? 0.75 : 1.0;
        colors[color++] = shadowVal;
        colors[color++] = shadowVal;
        colors[color++] = shadowVal;
    };

    for (let z = 0; z < size; z++) {
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                let val = getPoint(x, y, z);
                if (val) {
                    if (getPoint(x, y, z + 1) === 0) {
                        let face = faces[0];
                        for (let f = 0; f < 18; f += 3) {
                            addVertex(
                                x + face[f] / 2, y + face[f + 1] / 2, z + face[f + 2] / 2, val,
                                !!getPoint(x + face[f], y + face[f + 1], z + face[f + 2]) || !!getPoint(x, y + face[f + 1], z + face[f + 2]) || !!getPoint(x + face[f], y, z + face[f + 2])
                            );
                        }
                    }
                    if (getPoint(x, y, z - 1) === 0) {
                        let face = faces[1];
                        for (let f = 0; f < 18; f += 3) {
                            addVertex(
                                x + face[f] / 2, y + face[f + 1] / 2, z + face[f + 2] / 2, val,
                                !!getPoint(x + face[f], y + face[f + 1], z + face[f + 2]) || !!getPoint(x, y + face[f + 1], z + face[f + 2]) || !!getPoint(x + face[f], y, z + face[f + 2])
                            );
                        }
                    }
                    if (getPoint(x, y + 1, z) === 0) {
                        let face = faces[2];
                        for (let f = 0; f < 18; f += 3) {
                            addVertex(
                                x + face[f] / 2, y + face[f + 1] / 2, z + face[f + 2] / 2, val,
                                !!getPoint(x + face[f], y + face[f + 1], z + face[f + 2]) || !!getPoint(x, y + face[f + 1], z + face[f + 2]) || !!getPoint(x + face[f], y + face[f + 1], z)
                            );
                        }
                    }
                    if (getPoint(x, y - 1, z) === 0) {
                        let face = faces[3];
                        for (let f = 0; f < 18; f += 3) {
                            addVertex(
                                x + face[f] / 2, y + face[f + 1] / 2, z + face[f + 2] / 2, val,
                                !!getPoint(x + face[f], y + face[f + 1], z + face[f + 2]) || !!getPoint(x, y + face[f + 1], z + face[f + 2]) || !!getPoint(x + face[f], y + face[f + 1], z)
                            );
                        }
                    }
                    if (getPoint(x + 1, y, z) === 0) {
                        let face = faces[4];
                        for (let f = 0; f < 18; f += 3) {
                            addVertex(
                                x + face[f] / 2, y + face[f + 1] / 2, z + face[f + 2] / 2, val,
                                !!getPoint(x + face[f], y + face[f + 1], z + face[f + 2]) || !!getPoint(x + face[f], y, z + face[f + 2]) || !!getPoint(x + face[f], y + face[f + 1], z)
                            );
                        }
                    }
                    if (getPoint(x - 1, y, z) === 0) {
                        let face = faces[5];
                        for (let f = 0; f < 18; f += 3) {
                            addVertex(
                                x + face[f] / 2, y + face[f + 1] / 2, z + face[f + 2] / 2, val,
                                !!getPoint(x + face[f], y + face[f + 1], z + face[f + 2]) || !!getPoint(x + face[f], y, z + face[f + 2]) || !!getPoint(x + face[f], y + face[f + 1], z)
                            );
                        }
                    }
                }
            }
        }
    }

    return {
        materials: mats.slice(0, tri),
        vertices: verts.slice(0, i),
        colors: colors.slice(0, color)
    }
};

function buildChunkGeometry(data: Uint8Array, neighbors: Array<Array<Array<Uint8Array>>>): BufferGeometry {
    let arrays = buildChunkArrays(data, neighbors);
    if (arrays.vertices.length === 0) return null;
    //console.log(`Vertex array length: ${arrays.vertices.length}`);

    var geometry = new BufferGeometry();
    geometry.addAttribute('material', new BufferAttribute(arrays.materials, 1));
    geometry.addAttribute('position', new BufferAttribute(arrays.vertices, 3));
    geometry.addAttribute('color', new BufferAttribute(arrays.colors, 3));
    geometry.computeVertexNormals();

    return geometry;
}

export {
    buildChunkGeometry
}