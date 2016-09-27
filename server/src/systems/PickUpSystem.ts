import {System} from "../../../shared/systems";
import {ComponentId, ActionId} from "../../../shared/constants";
import {PositionComponent, InventoryComponent} from "../../../shared/components";
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

            pickableEntities.forEach((blockPosComponent, pickableEntity) => {
                let diffX = Math.pow(posComponent.x - blockPosComponent.x, 2);
                let diffY = Math.pow(posComponent.y - blockPosComponent.y, 2);
                let diffZ = Math.pow(posComponent.z - blockPosComponent.z, 2);

                if (diffX + diffY + diffZ < 2) {
                    let inventoryComponent = this.entityManager.getComponent<InventoryComponent>(entity, ComponentId.Inventory);

                    // If player has enough room for block, add to their inventory and delete from here
                    // so we don't get any duplication where it's given to multiple players.
                    let intoSlot = inventoryComponent.addEntity(pickableEntity);
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