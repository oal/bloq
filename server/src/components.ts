import {TextEncoder} from 'text-encoding';

import {Component, SerializableComponent} from "../../shared/components";
import EntityManager from "../../shared/EntityManager";
import {ComponentId, MessageType} from "../../shared/constants";

export class NetworkComponent extends Component {
    static ID = ComponentId.Network;

    websocket: WebSocket;
    private bufferPos: number = 0;
    private buffer: ArrayBuffer = new ArrayBuffer(1 << 16);

    bytesLeft(): number {
        return this.buffer.byteLength - this.bufferPos;
    }

    pushBuffer(msgType: MessageType, data: ArrayBuffer | string) {
        let bufferData: ArrayBuffer;
        if (typeof data === 'string') {
            let encoder = new TextEncoder();
            bufferData = encoder.encode(data).buffer;
        } else {
            bufferData = data;
        }

        if (this.bufferPos + bufferData.byteLength + 2 * Uint16Array.BYTES_PER_ELEMENT > this.buffer.byteLength) {
            console.error('Buffer is too small!');
            return;
        }

        let view = new DataView(this.buffer);

        // Insert length
        view.setUint16(this.bufferPos, bufferData.byteLength);
        this.bufferPos += Uint16Array.BYTES_PER_ELEMENT;

        // Message type
        view.setUint16(this.bufferPos, msgType);
        this.bufferPos += Uint16Array.BYTES_PER_ELEMENT;

        // Copy data
        let bufferArray = new Uint8Array(bufferData);
        for (let i = 0; i < bufferData.byteLength; i++) {
            view.setUint8(this.bufferPos++, bufferArray[i]);
        }
    }
}

export class ChunkSubscriptionComponent extends Component {
    static ID = ComponentId.ChunkSubscription;

    inChunk: [number, number, number];
    chunks: Map<string, boolean> = new Map<string, boolean>();
}

export class NewPlayerComponent extends Component {
    static ID = ComponentId.NewPlayer;
}

// A similar, but more full featured component is used on client. Same name, different implementation (for storing player mesh etc)
export class PlayerComponent extends SerializableComponent {
    static ID = ComponentId.Player;
}

export class PickableComponent extends SerializableComponent {
    static ID = ComponentId.Pickable;
}

export function registerServerComponents(manager: EntityManager) {
    manager.registerComponentType(new NetworkComponent());
    manager.registerComponentType(new ChunkSubscriptionComponent());
    manager.registerComponentType(new NewPlayerComponent());
    manager.registerComponentType(new PlayerComponent());
    manager.registerComponentType(new PickableComponent());
}