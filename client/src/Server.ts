import Game from "./Game";
import {objectHasKeys} from "../../shared/helpers";
import {initPlayerEntity} from "./entities";


export default class Server {
    url: string = 'ws://localhost:8081';
    ws: WebSocket;
    game: Game;

    constructor(game: Game) {
        this.game = game;

        this.ws = new WebSocket(this.url);
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
        let obj = JSON.parse(evt.data);
        if(objectHasKeys(obj.components, ['player'])) {
            console.log('create player')
            initPlayerEntity(this.game.world.entityManager, obj.entity, obj.components)
        } else {
            console.warn('Unknown packet')
        }
        console.log('message', evt);
    }

    onError(evt: MessageEvent) {
        console.log('error');
    }

    send(data) {
        this.ws.send(JSON.stringify(data));
    }
}