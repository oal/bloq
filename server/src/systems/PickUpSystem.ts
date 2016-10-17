import {System} from "../../../shared/System";
import {ComponentId, ActionId} from "../../../shared/constants";
import {PositionComponent, InventoryComponent, BlockComponent} from "../../../shared/components";
import {broadcastAction} from "../helpers";
import {PickUpEntityAction} from "../../../shared/actions";


export default class PickUpSystem extends System {
    update(dt: number) {
        let pickableEntities: Map<string, PositionComponent> = new Map<string, PositionComponent>();
        this.entityManager.getEntities(ComponentId.Pickable).forEach((component, entity) => {
            let posComponent = this.entityManager.getComponent<PositionComponent>(entity, ComponentId.Position);
            if (!posComponent) return;

            pickableEntities.set(entity, posComponent);
        });

        this.entityManager.getEntities(ComponentId.Player).forEach((component, entity) => {
            let posComponent = this.entityManager.getComponent<PositionComponent>(entity, ComponentId.Position);
            if (!posComponent) return;

            pickableEntities.forEach((blockPosComponent, pickableEntity) => {
                let diffX = Math.pow(posComponent.x - blockPosComponent.x, 2);
                let diffY = Math.pow((posComponent.y+1.5) - blockPosComponent.y, 2);
                let diffZ = Math.pow(posComponent.z - blockPosComponent.z, 2);

                if (diffX + diffY + diffZ < 2) {
                    let inventoryComponent = this.entityManager.getComponent<InventoryComponent>(entity, ComponentId.Inventory);

                    // Check if player already has block of this type in inventory.
                    // If so, increase count on block, and remove it.
                    let block = this.entityManager.getComponent<BlockComponent>(pickableEntity, ComponentId.Block);
                    let intoSlot = -1;
                    inventoryComponent.slots.forEach((invEntity, invSlot) => {
                        if(intoSlot !== -1) return;
                        let existingBlock = this.entityManager.getComponent<BlockComponent>(invEntity, ComponentId.Block);
                        if(existingBlock && existingBlock.kind === block.kind) {
                            existingBlock.count++;
                            intoSlot = invSlot;
                            this.entityManager.removeEntity(pickableEntity);
                        }
                    });

                    // Otherwise, insert to inventory in next available slot.
                    if(intoSlot === -1) intoSlot = inventoryComponent.setEntity(pickableEntity);
                    if (intoSlot !== -1) {
                        pickableEntities.delete(pickableEntity);
                        this.entityManager.removeComponentType(pickableEntity, ComponentId.Pickable);
                        broadcastAction(
                            this.entityManager, blockPosComponent.toChunk(),
                            ActionId.PickUpEntity, new PickUpEntityAction(entity, intoSlot, pickableEntity)
                        );
                    }
                }
            })
        })
    }
}