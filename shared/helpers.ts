import {TERRAIN_CHUNK_SIZE, ComponentId} from "./constants";
import {TerrainChunkComponent} from "./components";


let objectHasKeys = (obj: Object, keys: Array<ComponentId>) => keys.filter(key => key in obj).length == keys.length;

let mod = (a, b) => ((a % b) + b) % b;

let globalToChunk = (x: number) => {
    if (x < 0) return Math.ceil((x - TERRAIN_CHUNK_SIZE + 1) / TERRAIN_CHUNK_SIZE);
    else return Math.floor(x / TERRAIN_CHUNK_SIZE);
};

let chunkKey = (x: number, y: number, z: number) => `${x}x${y}x${z}`;


// Credits: http://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript?answertab=votes#tab-top
let arraysEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};


let deserializeTerrainChunk = (data: ArrayBuffer): [string, TerrainChunkComponent] => {
    let view = new DataView(data);
    let x = view.getInt32(0);
    let y = view.getInt32(Int32Array.BYTES_PER_ELEMENT);
    let z = view.getInt32(Int32Array.BYTES_PER_ELEMENT * 2);
    let chunkData = new Uint8Array(data.slice(Int32Array.BYTES_PER_ELEMENT * 3));

    let chunkComponent = new TerrainChunkComponent(x, y, z);
    chunkComponent.data = chunkData;
    return [`${x}x${y}x${z}`, chunkComponent]
};

export {
    objectHasKeys,
    mod,
    globalToChunk,
    chunkKey,
    arraysEqual,
    deserializeTerrainChunk,
}