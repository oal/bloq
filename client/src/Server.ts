import Game from "./Game";
import {objectHasKeys} from "../../shared/helpers";
import {initPlayerEntity} from "./entities";
import {TerrainChunkComponent} from "./components";

let deserializeTerrainChunk = (data: ArrayBuffer): [string, TerrainChunkComponent] => {
    let view = new DataView(data);
    let x = view.getInt32(0);
    let y = view.getInt32(Int32Array.BYTES_PER_ELEMENT);
    let z = view.getInt32(Int32Array.BYTES_PER_ELEMENT * 2);
    let chunkData = new Uint8Array(data.slice(Int32Array.BYTES_PER_ELEMENT*3));

    let chunkComponent = new TerrainChunkComponent();
    chunkComponent.data = chunkData;
    return [`${x}x${y}x${z}`, chunkComponent]
};

export default class Server {
    url: string = 'ws://localhost:8081';
    ws: WebSocket;
    game: Game;

    constructor(game: Game) {
        this.game = game;

        this.ws = new WebSocket(this.url);
        this.ws.binaryType = 'arraybuffer';
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onerror = this.onError.bind(this);
    }

    onOpen(evt: MessageEvent) {
        console.log('open');
    }

    onClose(evt: MessageEvent) {
        console.log('close');
    }

    onMessage(evt: MessageEvent) {
        console.log(evt.data)
        if (evt.data instanceof ArrayBuffer) {
            let [entity, component] = deserializeTerrainChunk(evt.data);
            this.game.world.entityManager.addComponent(entity, component);
        } else {
            let obj = JSON.parse(evt.data);
            if (objectHasKeys(obj.components, ['player'])) {
                console.log('create player')
                initPlayerEntity(this.game.world.entityManager, obj.entity, obj.components, this.game.world.camera);
            } else if (objectHasKeys(obj.components, ['input'])) {
                this.game.world.entityManager.deserializeAndSetEntity(evt.data);
            } else if (objectHasKeys(obj.components, ['yaw'])) {
                this.game.world.entityManager.deserializeAndSetEntity(evt.data);
            } else if (objectHasKeys(obj.components, ['removedentity'])) {
                this.game.world.entityManager.deserializeAndSetEntity(evt.data);
            } else {
                console.warn('Unknown packet: ', evt.data)
            }
        }
    }

    onError(evt: MessageEvent) {
        console.log('error');
    }

    send(data) {
        this.ws.send(JSON.stringify(data));
    }
}