import Initializer from "../../../shared/Initializer";
import {ComponentId, ActionId} from "../../../shared/constants";
import {PositionComponent} from "../../../shared/components";
import {MoveEntityAction} from "../../../shared/actions";
import {globalToChunk} from "../../../shared/helpers";
import {broadcastAction} from "../helpers";
import EntityManager from "../../../shared/EntityManager";
import {ServerActionManager} from "../actions";


export default class PositionInitializer extends Initializer{
    private actionManager: ServerActionManager;

    constructor(em: EntityManager, am: ServerActionManager) {
        super(em);
        this.actionManager = am;
    }

    initialize(entity: string, components: Object): void {
        let position = components[ComponentId.Position];
        let existingPosition = this.entityManager.getComponent<PositionComponent>(entity, ComponentId.Position);
        let prevPos: [number, number, number] = [existingPosition.x, existingPosition.y, existingPosition.z];
        let dist = Math.sqrt(Math.pow(position.x - existingPosition.x, 2) + Math.pow(position.y - existingPosition.y, 2) + Math.pow(position.z - existingPosition.z, 2));

        if (dist < 2) {
            existingPosition.update(position);
        } else {
            console.log('Too big difference between client and server!', dist);
            console.log(entity, prevPos);
            let action = new MoveEntityAction(entity, prevPos);
            this.actionManager.queueAction(action); // Queue on server as well.

            // Broad cast so it's queued on clients.
            let [cx, cy, cz] = prevPos.map(globalToChunk);
            broadcastAction(this.entityManager, [cx, cy, cz], ActionId.MoveEntity, action);
        }

    }
}