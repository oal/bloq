import {System} from "../../../shared/System";
import EntityManager from "../../../shared/EntityManager";
import {Server} from "../Server";


export default class NetworkSystem extends System {
    server: Server;
    bufferPos: number = 0;
    buffer: ArrayBuffer = new ArrayBuffer(1<<18);

    constructor(em: EntityManager, server: Server) {
        super(em);
        this.server = server;
    }

    update(dt: number): void {
        if(this.bufferPos === 0) return; // Nothing queued for this tick.

        // Send data and reset buffer.
        this.server.ws.send(this.buffer.slice(0, this.bufferPos));
        this.bufferPos = 0;
    }

    pushBuffer(data: ArrayBuffer | string) {
        let bufferData: ArrayBuffer;
        if(typeof data === 'string') {
            let encoder = new TextEncoder();
            bufferData = encoder.encode(data).buffer;
        } else {
            bufferData = data;
        }

        let view = new DataView(this.buffer);

        // Insert length
        view.setUint16(this.bufferPos, bufferData.byteLength);
        this.bufferPos += Uint16Array.BYTES_PER_ELEMENT;

        // Copy data
        let bufferArray = new Uint8Array(bufferData);
        for(let i = 0; i < bufferData.byteLength; i++) {
            view.setUint8(this.bufferPos++, bufferArray[i]);
        }
    }
}