import {Server as WebSocketServer} from 'ws';
import {PositionComponent} from "../../shared/components";
import uuid = require('node-uuid');
import World from "./World";
import {initPlayerEntity} from "./entities";

let hrtimeToSeconds = (hrtime: [number, number]) => hrtime[0] + hrtime[1] / 1000000000;

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

        this.startGameLoop();
    }

    startGameLoop() {
        //let t = 0.0;
        const dt = 1.0/30.0;

        let currentTime = hrtimeToSeconds(process.hrtime());
        let accumulator = 0.0;

        setInterval(() => {
            let newTime = hrtimeToSeconds(process.hrtime());
            let frameTime = newTime - currentTime;
            currentTime = newTime;

            accumulator += frameTime;

            while(accumulator >= dt) {
                //console.log('tick!', accumulator);
                this.tick(dt);
                accumulator -= dt;
                //t += dt;
            }
        }, 1);
    }

    tick(dt) {
        this.world.tick(dt);
    }

    onConnect(ws) {
        let entity = uuid.v4();
        initPlayerEntity(this.world.entityManager, entity);
        ws.send(this.world.entityManager.serializeEntity(entity));
    }

    onMessage(ws) {
        ws.on('message', function (message) {
            console.log('received: ' + message);
        });
    }
}