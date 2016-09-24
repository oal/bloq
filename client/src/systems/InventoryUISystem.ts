import {System} from "../../../shared/systems";
import {ComponentId} from "../../../shared/constants";
import {InventoryComponent} from "../../../shared/components";


export default class InventoryUISystem extends System {
    update(dt: number) {
        this.entityManager.getEntities(ComponentId.Inventory).forEach((component, entity) => {
            let inventory = this.entityManager.getComponent(entity, ComponentId.Inventory) as InventoryComponent;
            if(inventory.isDirty('activeSlot')) {
                let currentSlot = document.querySelector('#inventory .active');
                let newSlot = document.querySelectorAll('#inventory .inventory-row:first-child li')[inventory.activeSlot];

                currentSlot.className = '';
                newSlot.className = 'active';
            }
        });
    }
}