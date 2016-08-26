import EntityManager from "./EntityManager";
import {registerSharedComponents} from "./components";

export default class World {
    entityManager: EntityManager;

    constructor() {
        let em = new EntityManager();
        registerSharedComponents(em);

        this.entityManager = em;
    }
}