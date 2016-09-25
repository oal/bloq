import EntityManager from "./EntityManager";

// Base system which all other systems inherit from.
export class System {
    entityManager: EntityManager;

    constructor(em: EntityManager) {
        this.entityManager = em;
    }

    update(dt: number) {
        console.warn('Please override update.')
    }
}
