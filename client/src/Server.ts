import World from "./World";
import Game from "./Game";
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

    onOpen(evt) {
        console.log('open');
    }

    onClose(evt) {
        console.log('close');
    }

    onMessage(evt) {
        this.game.world.handlePacket(evt.data);
        console.log(this.game.world.entityManager.getEntities('player'))
        console.log('message', evt);
    }

    onError(evt) {
        console.log('error');
    }

    send(data) {
        this.ws.send(JSON.stringify(data));
    }
}