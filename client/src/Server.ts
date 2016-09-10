import Game from "./Game";
import {objectHasKeys} from "../../shared/helpers";
import {initPlayerEntity} from "./entities";
import {TerrainChunkComponent} from "../../shared/components";
import {MSG_ENTITY, MSG_TERRAIN, MSG_ACTION} from "../../shared/constants";
import {UnsubscribeTerrainChunksAction} from "../../shared/actions";

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
    url: string;
    ws: WebSocket;
    game: Game;

    constructor(game: Game, connCallback: Function) {
        this.game = game;

        this.url = `ws://${location.hostname}:${parseInt(location.port)+1}`;

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

        if (msgType === MSG_ENTITY) { // Entity as text
            let data = evt.data.slice(Uint16Array.BYTES_PER_ELEMENT);

            // Bytes -> JSON string -> Object.
            let decoder = new TextDecoder();
            let jsonStr = decoder.decode(data);
            let obj = JSON.parse(jsonStr);

            // Player component needs special care. For all others, just deserialize and update the entity manager.
            if (objectHasKeys(obj.components, ['player'])) {
                initPlayerEntity(this.game.world.entityManager, obj.entity, obj.components, this.game.world.camera);
            } else {
                this.game.world.entityManager.deserializeAndSetEntity(jsonStr);
            }
        } else if (msgType === MSG_ACTION) { // Action message
            let actionId = bufView.getUint16(Uint16Array.BYTES_PER_ELEMENT);
            let data = evt.data.slice(Uint16Array.BYTES_PER_ELEMENT * 2);

            // Bytes -> JSON string -> Object.
            let decoder = new TextDecoder();
            let jsonStr = decoder.decode(data);
            let obj = JSON.parse(jsonStr);

            // Queue action.
            this.game.world.actionManager.queueAction(actionId, obj);
        } else if (msgType === MSG_TERRAIN) { // Binary terrain message
            let data = evt.data.slice(Uint16Array.BYTES_PER_ELEMENT);
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