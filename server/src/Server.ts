import {Server as WebSocketServer} from 'ws';
import uuid = require('node-uuid');
import World from "./World";
import {initPlayerEntity} from "./entities";
import {objectHasKeys} from "../../shared/helpers";
import {updatePlayerInput, updatePlayerYaw} from "./systems";

let hrtimeToSeconds = (hrtime: number[]) => hrtime[0] + hrtime[1] / 1000000000;

export default class Server {
    wss: WebSocketServer;
    world: World;

    constructor() {
        this.world = new World();

        this.wss = new WebSocketServer({
            port: 8081
        });
        this.wss.on('connection', this.onConnect.bind(this));

        this.startGameLoop();
    }

    startGameLoop() {
        const dt = 1.0 / 30.0;

        let currentTime = hrtimeToSeconds(process.hrtime());
        let accumulator = 0.0;

        setInterval(() => {
            let newTime = hrtimeToSeconds(process.hrtime());
            let frameTime = newTime - currentTime;
            currentTime = newTime;

            accumulator += frameTime;

            while (accumulator >= dt) {
                this.tick(dt);
                accumulator -= dt;
            }
        }, 1);
    }

    tick(dt) {
        this.world.tick(dt);
    }

    onConnect(ws) {
        let playerEntity = uuid.v4();
        ws.on('message', (data, flags) => {
            let obj = JSON.parse(data);
            if (obj.entity == playerEntity) {
                if(objectHasKeys(obj.components, ['input', 'position'])) {
                    updatePlayerInput(this.world.entityManager, playerEntity, obj);
                }
                if(objectHasKeys(obj.components, ['yaw'])) {
                    updatePlayerYaw(this.world.entityManager, playerEntity, obj);
                }
            }
        });

        initPlayerEntity(this.world.entityManager, playerEntity);
        ws.send(this.world.entityManager.serializeEntity(playerEntity));
    }
}