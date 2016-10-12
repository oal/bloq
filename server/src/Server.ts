import {Server as WebSocketServer} from 'uws';
import {TextEncoder, TextDecoder} from 'text-encoding';

import World from "./World";
import {
    initPlayerEntity, updatePlayerInput, updatePlayerRotation, updatePlayerInventory,
    updatePlayerPosition
} from "./entities";
import {objectHasKeys} from "../../shared/helpers";
import {NetworkComponent} from "./components";
import {ComponentId, ActionId, MessageType} from "../../shared/constants";
import {Action} from "../../shared/actions";

let hrtimeToSeconds = (hrtime: number[]) => hrtime[0] + hrtime[1] / 1000000000;

export default class Server {
    wss: WebSocketServer;
    world: World;

    constructor() {
        this.world = new World(this);

        this.wss = new WebSocketServer({
            host: '0.0.0.0',
            port: 8081,
            perMessageDeflate: true,
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

    // TODO: These three might no longer belong here.
    static sendEntity(netComponent: NetworkComponent, str: string) {
        let encoder = new TextEncoder();
        let bytes = encoder.encode(str);

        netComponent.pushBuffer(MessageType.Entity, bytes.buffer);
    }

    // Could have been sendBinary or something, but currently only terrain is sent as binary
    static sendTerrainChunk(netComponent: NetworkComponent, buf: ArrayBuffer) {
        netComponent.pushBuffer(MessageType.Terrain, buf);
    }

    static sendAction(netComponent: NetworkComponent, actionId: ActionId, action: Action) {
        let bytes = action.serialize();

        // Give room for message type and action ID.
        const extraSpace = Uint16Array.BYTES_PER_ELEMENT;
        let packet = new ArrayBuffer(bytes.length + extraSpace);
        let packetView = new DataView(packet);

        // Set header data
        packetView.setUint16(0, actionId);

        // Copy over message data.
        for (let i = 0; i < bytes.length; i++) {
            packetView.setUint8(i + extraSpace, bytes[i]);
        }

        netComponent.pushBuffer(MessageType.Action, packet);
    }

    onConnect(ws) {
        let playerEntity = this.world.entityManager.createEntity();
        initPlayerEntity(this.world.entityManager, playerEntity, ws);

        let netComponent = this.world.entityManager.getComponent<NetworkComponent>(playerEntity, ComponentId.Network);
        Server.sendEntity(netComponent, this.world.entityManager.serializeEntity(playerEntity));

        let textDecoder = new TextDecoder();
        ws.on('message', (data: ArrayBuffer, flags) => {
            // Each message starts with its length, followed by that many bytes of content.
            // Length is always Uint16.
            // TODO: Extract to its own method.
            let pos = 0;
            let view = new DataView(data);
            while (pos < data.byteLength) {
                // Read length.
                let msgLength = view.getUint16(pos);
                pos += Uint16Array.BYTES_PER_ELEMENT;

                // Get message contents and decode JSON
                let msg = data.slice(pos, pos + msgLength);
                pos += msgLength;
                let text = textDecoder.decode(msg);
                let obj = JSON.parse(text);

                if (obj.entity == playerEntity) {
                    if (objectHasKeys(obj.components, [ComponentId.Input, ComponentId.Position])) {
                        updatePlayerInput(this.world.entityManager, playerEntity, obj);
                    }
                    if (objectHasKeys(obj.components, [ComponentId.Position])) {
                        updatePlayerPosition(this.world.entityManager, this.world.actionManager, playerEntity, obj);
                    }
                    if (objectHasKeys(obj.components, [ComponentId.Rotation])) {
                        updatePlayerRotation(this.world.entityManager, playerEntity, obj);
                    }
                    if (objectHasKeys(obj.components, [ComponentId.Inventory])) {
                        updatePlayerInventory(this.world.entityManager, playerEntity, obj);
                    }
                }
            }
        });

        ws.on('close', () => {
            console.log('Removing player', playerEntity);
            this.world.entityManager.removeEntity(playerEntity);
        })

    }
}