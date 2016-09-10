import {TextEncoder} from 'text-encoding';

export class Action {
    typeName(): string {
        let fullName = (this.constructor as any).name.toLowerCase();
        return fullName.substring(0, fullName.length - 6); // Everything except "Action".
    }

    serialize(): Uint8Array {
        // TODO: Should probably use an ID field instead of serializing the whole name of the action. Same for components.
        let str = JSON.stringify({action: this.typeName(), data: this});
        let encoder = new TextEncoder();
        let bytes = encoder.encode(str);
        return bytes;
    }
}


export class UnsubscribeTerrainChunksAction extends Action {
    chunkKeys: Array<string>;

    constructor(chunkKeys: Array<string>) {
        super();
        this.chunkKeys = chunkKeys;
    }
}