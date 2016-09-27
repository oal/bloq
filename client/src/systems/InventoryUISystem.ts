import {System} from "../../../shared/systems";
import {ComponentId} from "../../../shared/constants";
import {InventoryComponent} from "../../../shared/components";


const inventoryTopRow = '#inventory .inventory-row:first-child li';

export default class InventoryUISystem extends System {
    update(dt: number) {
        this.entityManager.getEntities(ComponentId.Inventory).forEach((component, entity) => {
            let inventory = this.entityManager.getComponent<InventoryComponent>(entity, ComponentId.Inventory);
            if (inventory.isDirty('activeSlot')) {
                let currentSlot = document.querySelector('#inventory .active');
                let newSlot = document.querySelectorAll(inventoryTopRow)[inventory.activeSlot];

                currentSlot.className = '';
                newSlot.className = 'active';
            }

            if (inventory.isDirty('slots')) {
                let inventoryElements = document.querySelectorAll(inventoryTopRow);
                // TODO: Add / remove elements or update background image instead of just hiding and displaying like this.
                inventory.slots.forEach((entity, index) => {
                    ((inventoryElements[index] as HTMLElement).children[0] as HTMLElement).style.display = entity ? 'block' : 'none';
                })
            }
        });
    }
}