# Bloq
Bloq is a multiplayer creative block building game inspired by Minecraft.
It's written in Typescript, and uses Three.js for rendering.

The game was made by Olav Lindekleiv for the course DAT215 ICT Project at the University of Agder,
in the fall semester of 2016.


## How to build / run
Install the typescript compiler.
```
npm install typescript -g
```

### Terminal 1: Server
```
cd bloq/server
npm install
tsc
node dist/server/src/main.js # Start server
```

### Terminal 2: Client
```
cd bloq/client
npm install
npm run serve
```

Go to [http://localhost:8080](http://localhost:8080)

### License
Mozilla Public License 2.0 (see the LICENSE file)
