export default class Server {
    url: string = 'ws://localhost:8081';
    ws: WebSocket;

    constructor() {
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
        console.log('message');
    }

    onError(evt) {
        console.log('error');
    }
}