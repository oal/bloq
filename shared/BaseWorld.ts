import EntityManager from "./EntityManager";
import {registerSharedComponents} from "./components";
import {updatePhysics, updateMovement, updatePositions, updateTerrainCollision} from "./systems";

export default class BaseWorld {
    entityManager: EntityManager;

    constructor() {
        let em = new EntityManager();
        registerSharedComponents(em);

        this.entityManager = em;
    }

    tick(dt) {
        updatePhysics(this.entityManager, dt);
        updateTerrainCollision(this.entityManager);
        updateMovement(this.entityManager, dt);
        updatePositions(this.entityManager, dt);


    }
}