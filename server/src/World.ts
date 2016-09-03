import BaseWorld from "../../shared/BaseWorld";
import {registerServerComponents} from "./components";
import {informNewPlayers, broadcastPlayerInput, removeEntities} from "./systems";
import {TerrainChunkComponent} from "../../shared/components";

export default class World extends BaseWorld {

    constructor() {
        super();
        this.entityManager.addComponent('0x0x0', new TerrainChunkComponent(0, 0, 0));
        this.entityManager.addComponent('1x0x0', new TerrainChunkComponent(1, 0, 0));
        this.entityManager.addComponent('0x0x1', new TerrainChunkComponent(0, 0, 1));
        this.entityManager.addComponent('1x0x1', new TerrainChunkComponent(1, 0, 1));
        this.entityManager.addComponent('-1x0x0', new TerrainChunkComponent(-1, 0, 0));
        registerServerComponents(this.entityManager);
    }


    tick(dt) {
        // Server only
        removeEntities(this.entityManager);
        informNewPlayers(this.entityManager);
        broadcastPlayerInput(this.entityManager);

        // Shared systems
        super.tick(dt);
    }
}