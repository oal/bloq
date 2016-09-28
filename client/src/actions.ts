import * as shared from "../../shared/actions";
import {ActionId, ComponentId} from "../../shared/constants";
import EntityManager from "../../shared/EntityManager";
import {InventoryComponent, BlockComponent} from "../../shared/components";


export class ClientActionManager extends shared.ActionManager {
    queueRawAction(id: number, data: Object) {
        switch (id) {
            case ActionId.UnsubscribeTerrainChunks:
                this.queue.push(new shared.UnsubscribeTerrainChunksAction(data['chunkKeys']));
                break;
            case ActionId.SetBlocks:
                let blocks = data['blocks'].map(block => [block[0], block[1], block[2], block[3]]);
                this.queue.push(new shared.SetBlocksAction(blocks));
                break;
            case ActionId.RemoveEntities:
                this.queue.push(new shared.RemoveEntitiesAction(data['entities']));
                break;
            case ActionId.MoveEntity:
                this.queue.push(new shared.MoveEntityAction(data['entity'], data['position'].map(num => parseFloat(num))));
                break;
            case ActionId.PickUpEntity:
                this.queue.push(new PickUpEntityAction(data['player'], data['inventorySlot'], data['pickable']));
                break;
            default:
                console.warn('Unknown action ID: ', id);
                return;
        }
    }
}

class PickUpEntityAction extends shared.PickUpEntityAction {
    constructor(playerEntity: string, inventorySlot: number, pickableEntity: string) {
        super(playerEntity, inventorySlot, pickableEntity);
    }

    execute(entityManager: EntityManager) {
        let inventoryComponent = entityManager.getComponent<InventoryComponent>(this.player, ComponentId.Inventory);
        let existingEntity = inventoryComponent.getEntity(this.inventorySlot);
        if (existingEntity) {
            let pickableBlock = entityManager.getComponent<BlockComponent>(this.pickable, ComponentId.Block);
            let existingBlock = entityManager.getComponent<BlockComponent>(existingEntity, ComponentId.Block);
            if(existingBlock.kind === pickableBlock.kind) {
                existingBlock.count++;
            }
        } else {
            inventoryComponent.setEntity(this.pickable, this.inventorySlot);
            entityManager.removeComponentType(this.pickable, ComponentId.Mesh);
        }
    }
}