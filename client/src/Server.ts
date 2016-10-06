import Game from "./Game";
import {MessageType, ComponentId} from "../../shared/constants";
import {bufferToObject} from "./helpers";
import {deserializeTerrainChunk} from "../../shared/helpers";



export interface EntityMessage {
    entity: string,
    components: {
        [propName: number]: Object
    }
}

export class Server {
    url: string;
    ws: WebSocket;
    game: Game;
    private componentHandlers: Map<ComponentId, Array<Function>> = new Map<ComponentId, Array<Function>>();

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
        //console.log('Got message');
        if (!(evt.data instanceof ArrayBuffer)) {
            console.error('Not array buffer!', evt.data);
        }

        let bufView = new DataView(evt.data);
        let msgType = bufView.getUint16(0);

        let data;
        let obj;
        switch(msgType) {
            case MessageType.Entity:
                data = evt.data.slice(Uint16Array.BYTES_PER_ELEMENT);
                obj = bufferToObject(data) as EntityMessage;

                Object.keys(obj.components).forEach(componentId => {
                    let key = parseInt(componentId);
                    this.emit(key as ComponentId, obj.entity, obj.components);
                });
                break;

            case MessageType.Terrain:
                data = evt.data.slice(Uint16Array.BYTES_PER_ELEMENT);
                let [entity, component] = deserializeTerrainChunk(data);

                let componentsObj = {};
                componentsObj[ComponentId.TerrainChunk] = component;
                this.emit(ComponentId.TerrainChunk, entity, componentsObj);
                break;

            case MessageType.Action:
                let actionId = bufView.getUint16(Uint16Array.BYTES_PER_ELEMENT);
                data = evt.data.slice(Uint16Array.BYTES_PER_ELEMENT * 2);

                obj = bufferToObject(data);

                // Queue action directly. No "event" to be emitted.
                this.game.world.actionManager.queueRawAction(actionId, obj);
                break;

            default:
                console.warn('Unknown message type: ', msgType)
        }
    }

    onError(evt: MessageEvent) {
        console.log('error');
    }

    addEventListener(componentId: ComponentId, listener) {
        let handlers = this.componentHandlers.get(componentId);
        if(!handlers) {
            handlers = [];
            this.componentHandlers.set(componentId, handlers);
        }
        handlers.push(listener);
    }

    private emit(componentId: ComponentId, entity: string, components: Object) {
        let handlers = this.componentHandlers.get(componentId);
        if(!handlers) return;

        handlers.forEach((callback) => {
            callback(entity, components);
        })
    }

    sendEntity(data: Object) {
        this.ws.send(JSON.stringify(data));
    }
}