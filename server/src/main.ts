var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 8081 });

wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        console.log('received: ' + message);
    });

    ws.send('something');
});