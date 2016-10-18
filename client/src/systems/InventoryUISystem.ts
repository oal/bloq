import {System} from "../../../shared/System";
import {ComponentId} from "../../../shared/constants";
import {InventoryComponent, BlockComponent} from "../../../shared/components";
import EntityManager from "../../../shared/EntityManager";
import HTMLParser from "../../lib/HTMLParser";
import '../../assets/stylesheets/inventory.scss';


const textureImages = [
    null,
    require('../../assets/blocks/1.png'),
    require('../../assets/blocks/2.png'),
    require('../../assets/blocks/3.png'),
    require('../../assets/blocks/4.png'),
    require('../../assets/blocks/5.png'),
    require('../../assets/blocks/6.png'),
    require('../../assets/blocks/7.png')
];

const html = `
    <div id="inventory">
        <ol class="inventory-row">
            <li class="active"><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
        </ol>
    </div>
`;

export default class InventoryUISystem extends System {
    private domNode: Element;
    private inventoryElements: NodeListOf<Element>;

    constructor(em: EntityManager) {
        super(em);

        // Parse and show in GUI.
        let parser = new HTMLParser();
        this.domNode = parser.parse(html);
        document.body.appendChild(this.domNode);

        // Set up selectors.
        this.inventoryElements = this.domNode.querySelectorAll('.inventory-row:first-child li');
    }

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.Inventory).forEach((component, entity) => {
            let inventory = this.entityManager.getComponent<InventoryComponent>(entity, ComponentId.Inventory);
            if (inventory.isDirty('activeSlot')) {
                let currentSlot = this.domNode.querySelector('#inventory .active');
                let newSlot = this.inventoryElements[inventory.activeSlot];

                currentSlot.className = '';
                newSlot.className = 'active';
            }

            // TODO: Add / remove elements or update background image instead of just hiding and displaying like this.
            inventory.slots.forEach((entity, index) => {
                let domBlock = ((this.inventoryElements[index] as HTMLElement).children[0] as HTMLElement);
                if(!domBlock) return; // If inventory slot is not filled, skip.

                domBlock.style.display = entity ? 'block' : 'none';
                if (entity) {
                    let block = this.entityManager.getComponent<BlockComponent>(entity, ComponentId.Block);
                    if (!block) return;

                    // Workaround for Firefox. It attempts to refetch 404s every tick even though value didn't change.
                    let newBg = `url("${textureImages[block.kind]}")`;
                    if (domBlock.style.backgroundImage !== newBg) domBlock.style.backgroundImage = newBg;

                    domBlock.innerText = '' + block.count;
                }
            })
        });
    }
}