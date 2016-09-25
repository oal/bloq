import {System} from "../../../shared/systems";
import {ServerActionManager} from "../actions";
import EntityManager from "../../../shared/EntityManager";
import {ComponentId, Side} from "../../../shared/constants";
import {
    InputComponent, InventoryComponent, PositionComponent, PhysicsComponent,
    BlockComponent, WallCollisionComponent, RotationComponent
} from "../../../shared/components";
import {SetBlocksAction} from "../../../shared/actions";
import {globalToChunk} from "../../../shared/helpers";
import {broadcastAction, broadcastEntity} from "../helpers";


export default class PlayerActionSystem extends System {
    actionManager: ServerActionManager;

    constructor(entityManager: EntityManager, actionManager: ServerActionManager) {
        super(entityManager);
        this.actionManager = actionManager;
    }

    update(dt: number): any {
        this.entityManager.getEntities(ComponentId.Input).forEach((component, entity) => {
            let inputComponent = component as InputComponent;

            let modifiedBlocks = [];
            if (inputComponent.isDirty('primaryAction') && inputComponent.primaryAction) {
                let target = inputComponent.target;
                modifiedBlocks.push([target[0], target[1], target[2], 0]);

                let blockEntity = this.entityManager.createEntity();
                let pos = new PositionComponent();
                pos.x = target[0];
                pos.y = target[1];
                pos.z = target[2];

                this.entityManager.addComponent(blockEntity, pos);
                let block = new BlockComponent();
                block.kind = 1;
                this.entityManager.addComponent(blockEntity, block);
                broadcastEntity(this.entityManager, target.map(globalToChunk), blockEntity);
            }

            if (inputComponent.isDirty('secondaryAction') && inputComponent.secondaryAction) {
                let target = inputComponent.target;

                let add = [0, 0, 0];
                switch (inputComponent.targetSide) {
                    case Side.Top:
                        add[1] = 1;
                        break;
                    case Side.North:
                        add[2] = 1;
                        break;
                    case Side.East:
                        add[0] = 1;
                        break;
                    case Side.South:
                        add[2] = -1;
                        break;
                    case Side.West:
                        add[0] = -1;
                        break;
                    case Side.Bottom:
                        add[1] = -1;
                        break;
                }

                // TODO: WIP. Should use entity in current slot instead of index as block type.
                let inventory = this.entityManager.getComponent(entity, ComponentId.Inventory) as InventoryComponent;
                modifiedBlocks.push([target[0] + add[0], target[1] + add[1], target[2] + add[2], inventory.activeSlot+1]);
            }


            // Broadcast so it's queued on clients.
            if (modifiedBlocks.length > 0) {
                let action = new SetBlocksAction(modifiedBlocks);
                let [cx, cy, cz] = inputComponent.target.map(globalToChunk);
                broadcastAction(this.entityManager, [cx, cy, cz], action);
                this.actionManager.queueAction(action); // Queue on server as well.
            }
        });
    }
}