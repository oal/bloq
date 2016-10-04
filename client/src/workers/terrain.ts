import {buildChunkArrays} from "../geometry/terrain";

onmessage = (e: MessageEvent) => {
    let chunkArrays = buildChunkArrays(e.data.data, e.data.neighborData);
    if (!chunkArrays) return;

    postMessage({
        entity: e.data.entity,
        arrays: chunkArrays
    });
};