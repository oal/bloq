import EntityManager from "./EntityManager";
import {registerSharedComponents} from "./components";
import {
    System, MovementSystem, PhysicsSystem, TerrainCollisionSystem, PositionSystem
} from "./systems";

export default class BaseWorld {
    entityManager: EntityManager;
    systems: Array<System> = [];
    systemsOrder: Array<number> = [];

    constructor() {
        let em = new EntityManager();
        registerSharedComponents(em);

        this.entityManager = em;

        this.addSystem(new PhysicsSystem(em), 1);
        this.addSystem(new TerrainCollisionSystem(em), 2);
        this.addSystem(new MovementSystem(em), 3);
        this.addSystem(new PositionSystem(em), 4);

        console.log(this.systems);
        console.log(this.systemsOrder)
    }

    addSystem(system: System, order: number = 0.0) {
        let higher = this.systemsOrder.map((ord, idx) => {
            return [ord, idx]
        }).filter(zip => zip[0] > order);

        if(higher.length == 0) {
            this.systems.push(system);
            this.systemsOrder.push(order);
        } else {
            this.systems.splice(higher[0][1], 0, system);
            this.systemsOrder.splice(higher[0][1], 0, order);
        }
    }

    tick(dt) {
        this.systems.forEach(system => system.update(dt))
    }
}