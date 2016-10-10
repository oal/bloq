import {System} from "../System";


export class CleanComponentsSystem extends System {
    update(dt: number): any {
        this.entityManager.cleanComponents();
    }
}