import EntityManager from "../../shared/EntityManager";
import {Server as WebSocketServer} from 'ws';

export default class Server {
    em: EntityManager;
    wss: WebSocketServer;
    
    constructor() {
        this.em = new EntityManager();

        var wss = new WebSocketServer({ port: 8081 });
        wss.on('connection', function (ws) {
            ws.on('message', function (message) {
                console.log('received: ' + message);
            });

            ws.send('something');
        });
    }
}