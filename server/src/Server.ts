import EntityManager from "../../shared/EntityManager";
import {Server as WebSocketServer} from 'ws';
import {PositionComponent, registerSharedComponents} from "../../shared/components";
import uuid = require('node-uuid');

export default class Server {
    entityManager: EntityManager;
    wss: WebSocketServer;

    constructor() {
        this.initEntityManager();

        this.wss = new WebSocketServer({
            port: 8081
        });
        this.wss.on('connection', this.onConnect.bind(this));
        this.wss.on('message', this.onMessage.bind(this));
    }

    initEntityManager() {
        let em = new EntityManager();
        registerSharedComponents(em);

        this.entityManager = em;
    }

    onConnect(ws) {
        let pos = new PositionComponent();
        let entity = uuid.v4();

        this.entityManager.addComponent(entity, pos);
        ws.send(this.entityManager.serializeEntity(entity));
    }

    onMessage(ws) {
        ws.on('message', function (message) {
            console.log('received: ' + message);
        });
    }
}