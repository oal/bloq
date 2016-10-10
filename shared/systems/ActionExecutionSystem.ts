import {System} from "../System";
import {ActionManager} from "../actions";
import EntityManager from "../EntityManager";


export default class ActionExecutionSystem extends System {
    actionManager: ActionManager;

    constructor(entityManager: EntityManager, actionManager: ActionManager) {
        super(entityManager);
        this.actionManager = actionManager;
    }

    update(dt: number): any {
        this.actionManager.executeAll(this.entityManager);
    }
}