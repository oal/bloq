import now = require('performance-now');

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
    systemTimings: Array<number> = [];
    tickNumber: number = 0;

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

        if (higher.length == 0) {
            this.systems.push(system);
            this.systemsOrder.push(order);
        } else {
            this.systems.splice(higher[0][1], 0, system);
            this.systemsOrder.splice(higher[0][1], 0, order);
        }

        this.systemTimings.push(0);
    }

    tick(dt) {
        let i = 0;
        let sumTime = 0;
        let frameTimes = new Float32Array(this.systems.length);
        this.systems.forEach(system => {
            let start = now();
            system.update(dt);
            let time = now() - start;
            frameTimes[i] = time;
            this.systemTimings[i] += time;
            sumTime += time;
            i++;
        });

        // if (this.tickNumber % 60 === 0) {
        //     console.log(`----\nTICK (${sumTime.toFixed(4)}ms)\n----`);
        //     for (var j = 0; j < this.systemTimings.length; j++) {
        //         let avgTime =(this.systemTimings[j]/this.tickNumber).toFixed(4);
        //         let currTime = frameTimes[j].toFixed(4);
        //         let sysName = this.systems[j].constructor.name;
        //         console.log(`${avgTime}ms\t ${currTime}ms\t ${sysName}`);
        //     }
        // }
        this.tickNumber++;

        if(dt > 60/1000) {
            console.log(`Tick took too ${dt}ms!`);
        }
    }
}