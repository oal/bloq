import {SkinnedMesh, Mesh, BoxGeometry, MeshNormalMaterial} from 'three';
import Game from "./Game";
import {objectHasKeys} from "../../shared/helpers";
import {initPlayerEntity} from "./entities";
import {TerrainChunkComponent} from "../../shared/components";
import {MSG_ENTITY, MSG_TERRAIN, MSG_ACTION, ComponentId} from "../../shared/constants";
import AnimatedMesh from "./AnimatedMesh";
import {MeshComponent} from "./components";

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

    constructor(game: Game, server: string, connCallback: Function) {
        this.game = game;

        this.url = `ws://${server}`;

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
            if (objectHasKeys(obj.components, [ComponentId.Player])) {
                initPlayerEntity(this.game.world.entityManager, obj.entity, obj.components, this.game.assetManager.getMesh('player') as AnimatedMesh, this.game.world.camera);
            } else if (objectHasKeys(obj.components, [ComponentId.Block])) {
                // TODO: Need a cleaner way for transferring and updating entities from / to server.
                this.game.world.entityManager.deserializeAndSetEntity(jsonStr);
                let meshComponent = new MeshComponent();
                meshComponent.mesh = new Mesh(new BoxGeometry(0.25, 0.25, 0.25), new MeshNormalMaterial());
                this.game.world.entityManager.addComponent(obj.entity, meshComponent);
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
            this.game.world.actionManager.queueRawAction(actionId, obj);
        } else if (msgType === MSG_TERRAIN) { // Binary terrain message
            let data = evt.data.slice(Uint16Array.BYTES_PER_ELEMENT);
            let [entity, component] = deserializeTerrainChunk(data);
            let chunkComponent = this.game.world.entityManager.addComponent(entity, component) as TerrainChunkComponent;
            chunkComponent.dirtyFields['data'] = true;
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