import {System} from "../systems";


export class CleanComponentsSystem extends System {
    update(dt: number): any {
        this.entityManager.cleanComponents();
    }
}