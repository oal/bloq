import BaseWorld from "../../shared/BaseWorld";
import {registerServerComponents} from "./components";
import {informNewPlayers, broadcastPlayerInput, removeEntities} from "./systems";
import {Terrain} from "./Terrain";

export default class World extends BaseWorld {
    terrain: Terrain = new Terrain();

    constructor() {
        super();
        registerServerComponents(this.entityManager);
    }


    tick(dt) {
        super.tick(dt);

        removeEntities(this.entityManager);
        informNewPlayers(this.entityManager);
        broadcastPlayerInput(this.entityManager);
    }
}