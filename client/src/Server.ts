import Game from "./Game";
import {objectHasKeys} from "../../shared/helpers";
import {initPlayerEntity} from "./entities";
import {TerrainChunkComponent} from "../../shared/components";
import {MSG_ENTITY, MSG_TERRAIN, MSG_ACTION} from "../../shared/constants";

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

export default class Server {
    url: string = 'ws://localhost:8081';
    ws: WebSocket;
    game: Game;

    constructor(game: Game, connCallback: Function) {
        this.game = game;

        this.ws = new WebSocket(this.url);
        this.ws.binaryType = 'arraybuffer';
        this.ws.onopen = connCallback;
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onerror = this.onError.bind(this);
    }

    onClose(evt: MessageEvent) {
        console.log('close');
    }

    onMessage(evt: MessageEvent) {
        console.log('Got message');
        if (!(evt.data instanceof ArrayBuffer)) {
            console.error('Not array buffer!', evt.data);
        }

        let bufView = new DataView(evt.data);
        let msgType = bufView.getUint16(0);
        let data = evt.data.slice(Uint16Array.BYTES_PER_ELEMENT);

        if (msgType === MSG_ENTITY) { // Entity as text
            let decoder = new TextDecoder();
            let jsonStr = decoder.decode(data);
            let obj = JSON.parse(jsonStr);

            if (objectHasKeys(obj.components, ['player'])) {
                initPlayerEntity(this.game.world.entityManager, obj.entity, obj.components, this.game.world.camera);
            } else {
                this.game.world.entityManager.deserializeAndSetEntity(evt.data);
            }
        } else if (msgType === MSG_ACTION) { // Action message
            let decoder = new TextDecoder();
            let jsonStr = decoder.decode(data);
            let obj = JSON.parse(jsonStr);

            if(obj.action === 'unsubscribeterrainchunks') {
                for(let chunkKey of obj.data.chunkKeys) {
                    this.game.world.entityManager.removeEntity(chunkKey);
                }
            }
        }  else if (msgType === MSG_TERRAIN) { // Binary terrain message
            let [entity, component] = deserializeTerrainChunk(data);
            this.game.world.entityManager.addComponent(entity, component);
        } else {
            console.warn('Unknown message type: ', msgType)
        }
    }

    onError(evt: MessageEvent) {
        console.log('error');
    }

    sendEntity(data: Object) {
        this.ws.send(JSON.stringify(data));
    }
}