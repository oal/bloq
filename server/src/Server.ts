import {Server as WebSocketServer} from 'ws';
import {PositionComponent} from "../../shared/components";
import uuid = require('node-uuid');
import World from "../../shared/World";

export default class Server {
    wss: WebSocketServer;
    world: World;

    constructor() {
        this.world = new World();

        this.wss = new WebSocketServer({
            port: 8081
        });
        this.wss.on('connection', this.onConnect.bind(this));
        this.wss.on('message', this.onMessage.bind(this));
    }

    tick() {
        console.log(123)
        setImmediate(this.tick.bind(this));
    }

    onConnect(ws) {
        let pos = new PositionComponent();
        let entity = uuid.v4();

        this.world.entityManager.addComponent(entity, pos);
        ws.send(this.world.entityManager.serializeEntity(entity));
    }

    onMessage(ws) {
        ws.on('message', function (message) {
            console.log('received: ' + message);
        });
    }
}