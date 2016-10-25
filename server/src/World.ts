import BaseWorld from "../../shared/BaseWorld";
import {registerServerComponents} from "./components";
import {ServerActionManager} from "./actions";
import {ComponentId, SystemOrder} from "../../shared/constants";
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
import PlayerInitializer from "./initializers/PlayerInitializer";


export default class World extends BaseWorld {
    constructor(server: Server) {
        super();
        this.actionManager = new ServerActionManager();

        registerServerComponents(this.entityManager);

        this.addSystem(new ActionExecutionSystem(this.entityManager, this.actionManager), SystemOrder.ActionExecution); // Always process first

        let initializerSystem = new InitializerSystem(this.entityManager, server.eventEmitter);
        initializerSystem.addInitializer(ComponentId.Player, new PlayerInitializer(this.entityManager));
        initializerSystem.addInitializer(ComponentId.Input, new PlayerInputInitializer(this.entityManager));
        initializerSystem.addInitializer(ComponentId.Position, new PositionInitializer(this.entityManager, this.actionManager));
        initializerSystem.addInitializer(ComponentId.Rotation, new RotationInitializer(this.entityManager));
        initializerSystem.addInitializer(ComponentId.Inventory, new InventoryInitializer(this.entityManager));
        initializerSystem.addInitializer(ComponentId.ChatMessage, new ChatMessageInitializer(this.entityManager));
        initializerSystem.addInitializer(ComponentId.ChunkRequest, new ChunkRequestInitializer(this.entityManager));
        this.addSystem(initializerSystem, SystemOrder.Initializer);

        this.addSystem(new ChatSystem(this.entityManager), SystemOrder.Chat);
        this.addSystem(new InformNewPlayersSystem(this.entityManager), SystemOrder.InformNewPlayers);
        this.addSystem(new BroadcastPlayerInputSystem(this.entityManager), SystemOrder.BroadcastPlayerInput);
        this.addSystem(new ChunkRequestSystem(this.entityManager), SystemOrder.ChunkRequest);
        this.addSystem(new PlayerActionSystem(this.entityManager, this.actionManager), SystemOrder.PlayerAction);
        this.addSystem(new PickUpSystem(this.entityManager), SystemOrder.PickUp);
        this.addSystem(new BroadcastEntitySystem(this.entityManager), SystemOrder.BroadcastEntity);

        this.addSystem(new NetworkSystem(this.entityManager, server), SystemOrder.Network);

        // Create DB system, restore world / entity manager, and then start listening for changes.
        let dbSystem = new DatabaseSystem(this.entityManager);
        this.addSystem(dbSystem, SystemOrder.Database);
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