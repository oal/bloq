import {System} from "../../../shared/System";
import {ServerActionManager} from "../actions";
import EntityManager from "../../../shared/EntityManager";
import {ComponentId, Side, ActionId, MessageType} from "../../../shared/constants";
import {InputComponent, InventoryComponent, BlockComponent} from "../../../shared/components";
import {SetBlocksAction, RemoveEntitiesAction} from "../../../shared/actions";
import {globalToChunk} from "../../../shared/helpers";
import {broadcastAction} from "../helpers";
import {initBlockEntity} from "../entities";
import {getValueGlobal} from "../terrain";
import {NetworkComponent} from "../components";
import Server from "../Server";


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

                // Find what block type is currently at dug position, and init a pickable block there if not air.
                let currentKind = getValueGlobal(this.entityManager, target[0], target[1], target[2]);
                if (currentKind !== 0) initBlockEntity(this.entityManager, target[0], target[1], target[2], currentKind);
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

                // TODO: Subtract from inventory when building.
                let inventory = this.entityManager.getComponent<InventoryComponent>(entity, ComponentId.Inventory);
                let inventoryBlockEntity = inventory.slots[inventory.activeSlot];
                let block = this.entityManager.getComponent<BlockComponent>(inventoryBlockEntity, ComponentId.Block);
                if (block) {
                    modifiedBlocks.push([target[0] + add[0], target[1] + add[1], target[2] + add[2], block.kind]);
                    block.count--;

                    let netComponent = this.entityManager.getComponent<NetworkComponent>(entity, ComponentId.Network);
                    netComponent.pushBuffer(MessageType.Entity, this.entityManager.serializeEntity(inventoryBlockEntity, [ComponentId.Block]));

                    if (block.count <= 0) {
                        this.entityManager.removeEntity(inventoryBlockEntity);
                        inventory.slots[inventory.activeSlot] = null;
                        netComponent.pushBuffer(MessageType.Entity, this.entityManager.serializeEntity(entity, [ComponentId.Inventory]));

                        let action = new RemoveEntitiesAction([inventoryBlockEntity]);
                        Server.sendAction(netComponent, ActionId.RemoveEntities, action);
                        this.actionManager.queueAction(action); // Queue on server as well.
                    }
                }

            }

            // Broadcast so it's queued on clients.
            if (modifiedBlocks.length > 0) {
                let action = new SetBlocksAction(modifiedBlocks);
                let [cx, cy, cz] = inputComponent.target.map(globalToChunk);
                broadcastAction(this.entityManager, [cx, cy, cz], ActionId.SetBlocks, action);
                this.actionManager.queueAction(action); // Queue on server as well.
            }
        });
    }
}