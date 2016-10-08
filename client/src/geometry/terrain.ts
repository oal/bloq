import {BufferAttribute, BufferGeometry} from 'three';


export function geometryFromArrays(arrays): BufferGeometry {
    var geometry = new BufferGeometry();
    geometry.addAttribute('material', new BufferAttribute(arrays.materials, 1));
    geometry.addAttribute('position', new BufferAttribute(arrays.vertices, 3));
    geometry.addAttribute('color', new BufferAttribute(arrays.colors, 3));
    //geometry.computeVertexNormals(); // Not needed unless lighting is added.
    geometry.computeBoundingBox();

    return geometry;
}