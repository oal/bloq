import {System} from "../../../shared/systems";
import {ComponentId} from "../../../shared/constants";
import {PositionComponent, InventoryComponent} from "../../../shared/components";


export default class PickUpSystem extends System {
    update(dt: number) {
        let pickableEntities: Map<string, PositionComponent> = new Map<>();
        this.entityManager.getEntities(ComponentId.Block).forEach((component, entity) => {
            let posComponent = this.entityManager.getComponent(entity, ComponentId.Position) as PositionComponent;
            if(!posComponent) return;

            pickableEntities.set(entity, posComponent);
        });
        this.entityManager.getEntities(ComponentId.Player).forEach((component, entity) => {
            let posComponent = this.entityManager.getComponent(entity, ComponentId.Position) as PositionComponent;

            pickableEntities.forEach((blockPosComponent, blockEntity) => {
                let diffX = Math.pow(posComponent.x - blockPosComponent.x, 2);
                let diffY = Math.pow(posComponent.y - blockPosComponent.y, 2);
                let diffZ = Math.pow(posComponent.z - blockPosComponent.z, 2);

                if(diffX+diffY+diffZ < 2) {
                    let inventoryComponent = this.entityManager.getComponent(entity, ComponentId.Inventory) as InventoryComponent;

                    // If player has enough room for block, add to their inventory and delete from here
                    // so we don't get any duplication where it's given to multiple players.
                    if(inventoryComponent.addEntity(blockEntity)) {
                        pickableEntities.delete(blockEntity);
                    }
                }
            })
        })
    }
}