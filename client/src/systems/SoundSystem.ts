import {System} from "../../../shared/System";
import {ComponentId} from "../../../shared/constants";
import AssetManager from "../../lib/AssetManager";
import Sound from "../../lib/Sound";
import EntityManager from "../../../shared/EntityManager";
import {
    PhysicsComponent, OnGroundComponent, InputComponent, InventoryComponent,
    BlockComponent
} from "../../../shared/components";


export default class SoundSystem extends System {
    walkSound: Sound;
    digSound: Sound;
    pickupSound: Sound;

    constructor(em: EntityManager, am: AssetManager) {
        super(em);

        this.walkSound = am.getSound('walk');
        this.digSound = am.getSound('dig');
        this.pickupSound = am.getSound('pickup');
    }

    update(dt: number): void {
        this.entityManager.getEntities(ComponentId.Player).forEach((component, entity) => {
            let physComponent = this.entityManager.getComponent<PhysicsComponent>(entity, ComponentId.Physics);
            if (!physComponent) return;

            // Walk
            let groundComponent = this.entityManager.getComponent<OnGroundComponent>(entity, ComponentId.OnGround);
            if (groundComponent && physComponent.isMovingHorizontally()) {
                this.walkSound.play();
            }

            // Dig
            let inputComponent = this.entityManager.getComponent<InputComponent>(entity, ComponentId.Input);
            if (inputComponent.primaryAction) {
                this.digSound.play();
            }
            /*
             else {
             this.digSound.stop(); // TODO: Enable if digging animation / delay is added
             }
             */
        });

        // Get current player and check their inventory, play "pick up" sound if changed..
        let [playerEntity, _] = this.entityManager.getFirstEntity(ComponentId.CurrentPlayer);
        if(!playerEntity) return; // Player is in init state, not fully joined yet.

        let inventoryComponent = this.entityManager.getComponent<InventoryComponent>(playerEntity, ComponentId.Inventory);
        inventoryComponent.slots.forEach((blockEntity) => {
            let block = this.entityManager.getComponent<BlockComponent>(blockEntity, ComponentId.Block);
            if (block && block.isDirty()) this.pickupSound.play();
        });
    }
}
