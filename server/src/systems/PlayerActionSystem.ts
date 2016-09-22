import {System} from "../../../shared/systems";
import {ServerActionManager} from "../actions";
import EntityManager from "../../../shared/EntityManager";
import {ComponentId} from "../../../shared/constants";
import {InputComponent} from "../../../shared/components";
import {RemoveBlocksAction} from "../../../shared/actions";
import {globalToChunk} from "../../../shared/helpers";
import {broadcastAction} from "../helpers";


export default class PlayerActionSystem extends System {
    actionManager: ServerActionManager;

    constructor(entityManager: EntityManager, actionManager: ServerActionManager) {
        super(entityManager);
        this.actionManager = actionManager;
    }

    update(dt: number): any {
        this.entityManager.getEntities(ComponentId.Input).forEach((component, entity) => {
            let inputComponent = component as InputComponent;

            if (inputComponent.isDirty('primaryAction') && inputComponent.primaryAction) {
                let action = new RemoveBlocksAction([inputComponent.actionTarget]);

                this.actionManager.queueAction(action); // Queue on server as well.

                // Broad cast so it's queued on clients.
                let [cx, cy, cz] = inputComponent.actionTarget.map(globalToChunk);
                broadcastAction(this.entityManager, [cx, cy, cz], action);
            }
        });
    }
}