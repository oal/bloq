import {BoxBufferGeometry, BufferAttribute} from 'three';
import {BlockId} from "../../../shared/constants";

export function buildBlockGeometry(material: BlockId) {
    var geometry = new BoxBufferGeometry(1, 1, 1);

    let materialData = new Float32Array(36);
    for(let i = 0; i < materialData.length; i++) {
        materialData[i] = material;
    }

    geometry.addAttribute('material', new BufferAttribute(materialData, 1));
    geometry.computeVertexNormals();

    return geometry;
}