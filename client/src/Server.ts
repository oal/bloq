import Game from "./Game";
import {MessageType, ComponentId} from "../../shared/constants";
import {bufferToObject} from "./helpers";
import {deserializeTerrainChunk} from "../../shared/helpers"
import {ComponentEventEmitter} from "../../shared/EventEmitter";
import {EntityMessage} from "../../shared/interfaces";


export class Server {
    url: string;
    ws: WebSocket;
    game: Game;
    eventEmitter: ComponentEventEmitter = new ComponentEventEmitter();

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

    private onClose(evt: MessageEvent) {
        console.log('close');
    }

    private onMessage(evt: MessageEvent) {
        if (!(evt.data instanceof ArrayBuffer)) {
            console.error('Not array buffer!', evt.data);
        }

        let buf = evt.data;
        let bufView = new DataView(buf);
        let bufPos = 0;

        while (bufPos < buf.byteLength) {
            let msgLength = bufView.getUint16(bufPos);
            bufPos += Uint16Array.BYTES_PER_ELEMENT;

            let msgType = bufView.getUint16(bufPos);
            bufPos += Uint16Array.BYTES_PER_ELEMENT;

            let msgData = buf.slice(bufPos, bufPos + msgLength);
            bufPos += msgLength;

            let obj;
            switch (msgType) {
                case MessageType.Entity:
                    obj = bufferToObject(msgData) as EntityMessage;

                    Object.keys(obj.components).forEach(componentId => {
                        let key = parseInt(componentId);
                        this.eventEmitter.emit(key as ComponentId, obj.entity, obj.components);
                    });
                    break;

                case MessageType.Terrain:
                    let [entity, component] = deserializeTerrainChunk(msgData);

                    let componentsObj = {};
                    componentsObj[ComponentId.TerrainChunk] = component;
                    this.eventEmitter.emit(ComponentId.TerrainChunk, entity, componentsObj);
                    break;

                case MessageType.Action:
                    let actionId = new DataView(msgData).getUint16(0);
                    let data = msgData.slice(Uint16Array.BYTES_PER_ELEMENT);

                    obj = bufferToObject(data);

                    // Queue action directly. No "event" to be emitted.
                    this.game.world.actionManager.queueRawAction(actionId, obj);
                    break;

                default:
                    console.warn('Unknown message type: ', msgType, msgData.byteLength)
            }
        }
    }

    private onError(evt: MessageEvent) {
        console.log('error');
    }
}