import EntityManager from "./EntityManager";
import {registerSharedComponents} from "./components";

export default class BaseWorld {
    entityManager: EntityManager;

    constructor() {
        let em = new EntityManager();
        registerSharedComponents(em);

        this.entityManager = em;
    }

    // This should never be used. Use proper systems ordering on server and client instead.
    tick(dt) {
    }
}