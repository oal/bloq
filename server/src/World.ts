import BaseWorld from "../../shared/BaseWorld";
import {registerServerComponents} from "./components";
import {ServerActionManager} from "./actions";
import {ComponentId} from "../../shared/constants";
import Server from "./Server";

import ActionExecutionSystem from "../../shared/systems/ActionExecutionSystem";
import InformNewPlayersSystem from "./systems/InformNewPlayersSystem";
import BroadcastPlayerInputSystem from "./systems/BroadcastPlayerInputSystem";
import PlayerActionSystem from "./systems/PlayerActionSystem";
import PickUpSystem from "./systems/PickUpSystem";
import BroadcastEntitySystem from "./systems/BroadcastEntitySystem";
import DatabaseSystem from "./systems/DatabaseSystem";
import NetworkSystem from "./systems/NetworkSystem";
import ChatSystem from "./systems/ChatSystem";
import InitializerSystem from "../../shared/systems/InitializerSystem";

import PlayerInputInitializer from "./initializers/PlayerInputInitializer";
import PositionInitializer from "./initializers/PositionInitializer";
import RotationInitializer from "./initializers/RotationInitializer";
import InventoryInitializer from "./initializers/InventoryInitializer";
import ChatMessageInitializer from "./initializers/ChatMessageInitializer";
import ChunkRequestInitializer from "./initializers/ChunkRequestInitializer";
import ChunkRequestSystem from "./systems/ChunkRequestSystem";


export default class World extends BaseWorld {
    constructor(server: Server) {
        super();
        this.actionManager = new ServerActionManager();

        registerServerComponents(this.entityManager);

        this.addSystem(new ActionExecutionSystem(this.entityManager, this.actionManager), -1000); // Always process first

        let initializerSystem = new InitializerSystem(this.entityManager, server.eventEmitter);
        initializerSystem.addInitializer(ComponentId.Input, new PlayerInputInitializer(this.entityManager));
        initializerSystem.addInitializer(ComponentId.Position, new PositionInitializer(this.entityManager, this.actionManager));
        initializerSystem.addInitializer(ComponentId.Rotation, new RotationInitializer(this.entityManager));
        initializerSystem.addInitializer(ComponentId.Inventory, new InventoryInitializer(this.entityManager));
        initializerSystem.addInitializer(ComponentId.ChatMessage, new ChatMessageInitializer(this.entityManager));
        initializerSystem.addInitializer(ComponentId.ChunkRequest, new ChunkRequestInitializer(this.entityManager));
        this.addSystem(initializerSystem, -999);

        this.addSystem(new ChatSystem(this.entityManager), -998);
        this.addSystem(new InformNewPlayersSystem(this.entityManager), -9);
        this.addSystem(new BroadcastPlayerInputSystem(this.entityManager), -8);
        this.addSystem(new ChunkRequestSystem(this.entityManager), 100);
        this.addSystem(new PlayerActionSystem(this.entityManager, this.actionManager), 101);
        this.addSystem(new PickUpSystem(this.entityManager), 102);
        this.addSystem(new BroadcastEntitySystem(this.entityManager), 103);

        this.addSystem(new NetworkSystem(this.entityManager, server), 409);

        // Create DB system, restore world / entity manager, and then start listening for changes.
        let dbSystem = new DatabaseSystem(this.entityManager);
        this.addSystem(dbSystem, 500);
        dbSystem.restore(() => {
            console.log('Loaded entities from database.');
            dbSystem.registerEntityEvents();
        });


        console.log(this.systems);
        console.log(this.systemsOrder)
    }


    tick(dt) {
        super.tick(dt);
    }
}