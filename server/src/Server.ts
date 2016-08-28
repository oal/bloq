import {Server as WebSocketServer} from 'ws';
import uuid = require('node-uuid');
import World from "./World";
import {initPlayerEntity} from "./entities";

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
        let playerEntity = uuid.v4();
        ws.on('message', (data, flags) => {
            let obj = JSON.parse(data);
            if(obj.entity == playerEntity) {
                for(let componentType in obj.components) {
                    if(!obj.components.hasOwnProperty(componentType)) continue;

                    let existingComponent = this.world.entityManager.getComponent(playerEntity, componentType);
                    if(existingComponent.isSync()) {
                        let componentData = obj.components[componentType];
                        // Never allow client to set sync to false and expect it to be accepted.
                        componentData['sync'] = true;

                        existingComponent.update(componentData);
                        existingComponent.setDirty(true);
                    }
                    console.log(componentType)
                }
            }
            console.log('received: ' + data);
        });

        initPlayerEntity(this.world.entityManager, playerEntity);
        ws.send(this.world.entityManager.serializeEntity(playerEntity));
    }
}