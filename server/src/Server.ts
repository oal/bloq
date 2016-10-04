import {Server as WebSocketServer} from 'ws';
import {TextEncoder} from 'text-encoding';
import uuid = require('node-uuid');
import World from "./World";
import {initPlayerEntity, updatePlayerInput, updatePlayerRotation, updatePlayerInventory} from "./entities";
import {objectHasKeys} from "../../shared/helpers";
import {NetworkComponent} from "./components";
import {ComponentId, ActionId, MessageType} from "../../shared/constants";
import {Action} from "../../shared/actions";

let hrtimeToSeconds = (hrtime: number[]) => hrtime[0] + hrtime[1] / 1000000000;

export default class Server {
    wss: WebSocketServer;
    world: World;

    constructor() {
        this.world = new World();

        this.wss = new WebSocketServer({
            host: '0.0.0.0',
            port: 8081
        });
        this.wss.on('connection', this.onConnect.bind(this));

        this.startGameLoop();
    }

    startGameLoop() {
        const dt = 1.0 / 60.0;

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

    static sendEntity(ws: WebSocket, str: string) {
        console.log('Sending:', str);
        let encoder = new TextEncoder();
        let bytes = encoder.encode(str);

        let packet = new ArrayBuffer(Uint16Array.BYTES_PER_ELEMENT + bytes.length * bytes.BYTES_PER_ELEMENT);
        let packetView = new DataView(packet);
        for (let i = 0; i < bytes.length; i++) {
            packetView.setUint8(i + Uint16Array.BYTES_PER_ELEMENT, bytes[i]);
        }
        packetView.setUint16(0, MessageType.Entity);

        ws.send(packet);
    }

    // Could have been sendBinary or something, but currently only terrain is sent as binary
    static sendTerrainChunk(ws: WebSocket, buf: ArrayBuffer) {
        let packet = new ArrayBuffer(Uint16Array.BYTES_PER_ELEMENT + buf.byteLength);
        let data = new Uint8Array(buf);

        // TODO: There might be a builtin way to do this faster.
        let packetView = new DataView(packet);
        for (let i = 0; i < buf.byteLength; i++) {
            packetView.setUint8(i + Uint16Array.BYTES_PER_ELEMENT, data[i]);
        }

        packetView.setUint16(0, MessageType.Terrain);
        ws.send(packet);
    }

    static sendAction(ws: WebSocket, actionId: ActionId, action: Action) {
        let bytes = action.serialize();

        // Give room for message type and action ID.
        const extraSpace = Uint16Array.BYTES_PER_ELEMENT * 2;
        let packet = new ArrayBuffer(bytes.length * bytes.BYTES_PER_ELEMENT + extraSpace);
        let packetView = new DataView(packet);

        // Set header data
        packetView.setUint16(0, MessageType.Action);
        packetView.setUint16(Uint16Array.BYTES_PER_ELEMENT, actionId);

        // Copy over message data.
        for (let i = 0; i < bytes.length; i++) {
            packetView.setUint8(i + extraSpace, bytes[i]);
        }

        ws.send(packet);
    }

    onConnect(ws) {
        let playerEntity = this.world.entityManager.createEntity();
        initPlayerEntity(this.world.entityManager, playerEntity, ws);

        let netComponent = this.world.entityManager.getComponent<NetworkComponent>(playerEntity, ComponentId.Network);
        Server.sendEntity(netComponent.websocket, this.world.entityManager.serializeEntity(playerEntity));

        ws.on('message', (data, flags) => {
            let obj = JSON.parse(data);
            if (obj.entity == playerEntity) {
                if (objectHasKeys(obj.components, [ComponentId.Input, ComponentId.Position])) {
                    updatePlayerInput(this.world.entityManager, this.world.actionManager, playerEntity, obj);
                }
                if (objectHasKeys(obj.components, [ComponentId.Rotation])) {
                    updatePlayerRotation(this.world.entityManager, playerEntity, obj);
                }
                if (objectHasKeys(obj.components, [ComponentId.Inventory])) {
                    updatePlayerInventory(this.world.entityManager, playerEntity, obj);
                }
            }
        });

        ws.on('close', () => {
            console.log('Removing player', playerEntity);
            this.world.entityManager.removeEntity(playerEntity);
        })

    }
}