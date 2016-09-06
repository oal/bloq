import BaseWorld from "../../shared/BaseWorld";
import {registerServerComponents} from "./components";
import {
    RemoveEntitySystem, InformNewPlayersSystem, BroadcastPlayerInputSystem, ChunkSubscriptionSystem
} from "./systems";
import {Terrain} from "./terrain";

export default class World extends BaseWorld {
    terrain = new Terrain();

    constructor() {
        super();
        registerServerComponents(this.entityManager);

        this.addSystem(new RemoveEntitySystem(this.entityManager), -10);
        this.addSystem(new InformNewPlayersSystem(this.entityManager), -9);
        this.addSystem(new BroadcastPlayerInputSystem(this.entityManager), -8);
        this.addSystem(new ChunkSubscriptionSystem(this.entityManager, this.terrain), 100);

        console.log(this.systems);
        console.log(this.systemsOrder)
    }


    tick(dt) {
        super.tick(dt);
    }
}