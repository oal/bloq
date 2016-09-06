import {BufferAttribute, BufferGeometry} from 'three';
import {TERRAIN_CHUNK_SIZE} from "../../shared/constants";

const size = TERRAIN_CHUNK_SIZE;


let buildChunkArrays = (data) => {
    let i = 0;
    let tri = 0;

    let mats = new Float32Array(size*size*size*16);
    let verts = new Float32Array(size*size*size*32);

    let getPoint = (x, y, z) => {
        if (x < 0 || y < 0 || z < 0 || x >= size || y >= size || z >= size) return 0;
        return data[y * size * size + z * size + x];
    };

    for (let z = 0; z < size; z++) {
        let oz = z; // z - size / 2;
        for (let y = 0; y < size; y++) {
            let oy = y; // y - size / 2;
            for (let x = 0; x < size; x++) {
                let val = getPoint(x, y, z);
                if (val) {
                    let ox = x; // = x - size / 2;
                    if (!getPoint(x, y, z + 1)) {
                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;


                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz + 0.5;

                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                    }
                    if (!getPoint(x, y, z - 1)) {
                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;


                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz - 0.5;

                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                    }
                    if (!getPoint(x, y + 1, z)) {
                        verts[i++] = ox - 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz - 0.5;


                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;

                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                    }
                    if (!getPoint(x, y - 1, z)) {
                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz + 0.5;


                        verts[i++] = ox + 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;

                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                    }
                    if (!getPoint(x + 1, y, z)) {

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;


                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;

                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                    }

                    if (!getPoint(x - 1, y, z)) {
                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz - 0.5;


                        verts[i++] = ox - 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz + 0.5;

                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                        mats[tri++] = val;
                    }
                }
            }
        }
    }

    return {
        materials: mats.slice(0, tri),
        vertices: verts.slice(0, i)
    }
};

function buildChunkGeometry(data): BufferGeometry {
    let arrays = buildChunkArrays(data);
    if(arrays.vertices.length === 0) return null;

    var geometry = new BufferGeometry();
    geometry.addAttribute('material', new BufferAttribute(arrays.materials, 1));
    geometry.addAttribute('position', new BufferAttribute(arrays.vertices, 3));
    geometry.computeVertexNormals();

    return geometry;
}

export {
    buildChunkGeometry
}