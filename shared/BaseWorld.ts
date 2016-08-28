import EntityManager from "./EntityManager";
import {registerSharedComponents} from "./components";
import {updateMovement} from "./systems";

export default class BaseWorld {
    entityManager: EntityManager;

    constructor() {
        let em = new EntityManager();
        registerSharedComponents(em);

        this.entityManager = em;
    }

    tick(dt) {
        updateMovement(this.entityManager, dt);
    }
}