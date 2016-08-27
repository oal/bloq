import EntityManager from "./EntityManager";
import {registerSharedComponents} from "./components";
import {update_movement} from "./systems";

export default class World {
    entityManager: EntityManager;

    constructor() {
        let em = new EntityManager();
        registerSharedComponents(em);

        this.entityManager = em;
    }

    handlePacket(data: string) {
        this.entityManager.deserializeAndSetEntity(data);
    }

    tick(dt) {
        update_movement(this.entityManager, dt);
    }
}