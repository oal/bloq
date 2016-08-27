import World from "./World";
export default class Server {
    url: string = 'ws://localhost:8081';
    ws: WebSocket;
    world: World;

    constructor() {
        this.world = new World();

        this.ws = new WebSocket(this.url);
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onerror = this.onError.bind(this);
    }

    tick() {
        this.world.tick(0.1);
    }

    onOpen(evt) {
        console.log('open');
    }

    onClose(evt) {
        console.log('close');
    }

    onMessage(evt) {
        this.world.handlePacket(evt.data);
        console.log(this.world.entityManager.getEntities('player'))
        console.log('message', evt);
    }

    onError(evt) {
        console.log('error');
    }
}