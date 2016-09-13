import BaseWorld from "../../shared/BaseWorld";
import {registerServerComponents} from "./components";
import {
    InformNewPlayersSystem, BroadcastPlayerInputSystem, ChunkSubscriptionSystem, PlayerActionSystem
} from "./systems";
import {Terrain} from "./terrain";
import {ActionExecutionSystem} from "../../shared/systems";
import {ServerActionManager} from "./actions";

export default class World extends BaseWorld {
    terrain = new Terrain();

    constructor() {
        super();
        this.actionManager = new ServerActionManager();

        registerServerComponents(this.entityManager);

        this.addSystem(new ActionExecutionSystem(this.entityManager, this.actionManager), -1000); // Always process first
        //this.addSystem(new RemoveEntitySystem(this.entityManager), -10);
        this.addSystem(new InformNewPlayersSystem(this.entityManager), -9);
        this.addSystem(new BroadcastPlayerInputSystem(this.entityManager), -8);
        this.addSystem(new ChunkSubscriptionSystem(this.entityManager, this.terrain), 100);
        this.addSystem(new PlayerActionSystem(this.entityManager), 101);

        console.log(this.systems);
        console.log(this.systemsOrder)
    }


    tick(dt) {
        super.tick(dt);
    }
}