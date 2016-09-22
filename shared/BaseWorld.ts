import EntityManager from "./EntityManager";
import {registerSharedComponents} from "./components";
import {System} from "./systems";
import {ActionManager} from "./actions";

import PhysicsSystem from "./systems/PhysicsSystem";
import TerrainCollisionSystem from "./systems/TerrainCollisionSystem";
import MovementSystem from "./systems/MovementSystem";
import PositionSystem from "./systems/PositionSystem";
import {CleanComponentsSystem} from "./systems/CleanComponentsSystem";


export default class BaseWorld {
    entityManager: EntityManager;
    actionManager: ActionManager;

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

        // Cleaning is the last thing we do in each tick.
        this.addSystem(new CleanComponentsSystem(em), 10000);
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