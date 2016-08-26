import EntityManager from "../../shared/EntityManager";
import {Server as WebSocketServer} from 'ws';
import {PositionComponent} from "../../shared/components";
import uuid = require('node-uuid');

export default class Server {
    em: EntityManager;
    wss: WebSocketServer;

    constructor() {
        this.em = new EntityManager();

        this.wss = new WebSocketServer({
            port: 8081
        });
        this.wss.on('connection', this.onConnect.bind(this));
        this.wss.on('message', this.onMessage.bind(this));
    }

    onConnect(ws) {
        let pos = new PositionComponent();
        let entity = uuid.v4();

        this.em.addComponent(entity, pos);
        ws.send(this.em.serializeEntity(entity));
    }

    onMessage(ws) {
        ws.on('message', function (message) {
            console.log('received: ' + message);
        });
    }
}