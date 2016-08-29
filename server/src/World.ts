import BaseWorld from "../../shared/BaseWorld";
import {registerServerComponents} from "./components";
import {informNewPlayers, broadcastPlayerInput} from "./systems";

export default class World extends BaseWorld {
    constructor() {
        super();
        registerServerComponents(this.entityManager);
    }


    tick(dt) {
        super.tick(dt);

        informNewPlayers(this.entityManager);
        broadcastPlayerInput(this.entityManager);
    }
}