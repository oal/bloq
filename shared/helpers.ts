import {TERRAIN_CHUNK_SIZE} from "./constants";


let objectHasKeys = (obj: Object, keys: Array<string>) => keys.filter(key => key in obj).length == keys.length;

let mod = (a, b) => ((a % b) + b) % b;

let globalToChunk = (x: number) => {
    if (x < 0) return Math.ceil((x - TERRAIN_CHUNK_SIZE) / TERRAIN_CHUNK_SIZE);
    else return Math.floor(x / TERRAIN_CHUNK_SIZE);
};

let chunkKey = (x: number, y: number, z: number) => `${x}x${y}x${z}`;


export {
    objectHasKeys,
    mod,
    globalToChunk,
    chunkKey,
}