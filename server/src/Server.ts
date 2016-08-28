import {Server as WebSocketServer} from 'ws';
import uuid = require('node-uuid');
import World from "./World";
import {initPlayerEntity} from "./entities";
import {PositionComponent} from "../../shared/components";

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
                if ('input' in obj.components && 'position' in obj.components) {
                    let input = obj.components['input'];
                    let position = obj.components['position'];

                    let existingInput = this.world.entityManager.getComponent(playerEntity, 'input');
                    existingInput.update(input);

                    let existingPosition = this.world.entityManager.getComponent(playerEntity, 'position') as PositionComponent;
                    let dist = Math.sqrt(Math.pow(position.x - existingPosition.x, 2) + Math.pow(position.y - existingPosition.y, 2) + Math.pow(position.z - existingPosition.z, 2));

                    existingPosition.update(position);
                    if (dist > 0.5) {
                        // TODO: Send correction to client.
                        console.log('Too big difference between client and server!', dist);
                    }
                }
            }
        });

        initPlayerEntity(this.world.entityManager, playerEntity);
        ws.send(this.world.entityManager.serializeEntity(playerEntity));
    }
}