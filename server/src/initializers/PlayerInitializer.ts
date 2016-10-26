import Initializer from "../../../shared/Initializer";
import {ComponentId, MessageType} from "../../../shared/constants";
import {
    PositionComponent, PhysicsComponent, RotationComponent, InventoryComponent,
    BlockComponent, CurrentPlayerComponent, WallCollisionComponent, ChunkRequestComponent, InputComponent,
    PlayerComponent
} from "../../../shared/components";
import {NewPlayerComponent, NetworkComponent} from "../components";


export default class PlayerInitializer extends Initializer {
    initialize(entity: string, components: Object): void {
        // Only process further if name is set. We don't want players without names.
        let playerComponentData = components[ComponentId.Player];
        if(!playerComponentData['name']) return;

        // Initialize the rest of the player (until now, there's been just a PlayerComponent waiting for a name to be set).
        console.log('Initializing new player with name ' + playerComponentData['name']);

        let em = this.entityManager;

        // Update name.
        let playerComponent = em.getComponent<PlayerComponent>(entity, ComponentId.Player);
        playerComponent.name = playerComponentData['name'];

        // Add new components
        let pos = new PositionComponent();
        pos.y = 24;
        pos.x = 8;
        pos.z = 8;
        em.addComponent(entity, pos); // Position tracking

        em.addComponent(entity, new PhysicsComponent());
        em.addComponent(entity, new RotationComponent());

        let netComponent = em.getComponent<NetworkComponent>(entity, ComponentId.Network);
        let inventory = new InventoryComponent();
        // This should be done elsewhere:
        for (let i = 0; i < 9; i++) {
            let blockEntity = em.createEntity();
            let block = new BlockComponent();
            block.kind = i + 1;
            block.count = 99;

            em.addComponent(blockEntity, block);
            let pos = new PositionComponent();
            pos.y = 15;
            pos.x = 5;
            pos.z = 5;
            em.addComponent(blockEntity, pos);

            inventory.slots[i] = blockEntity;
            netComponent.pushBuffer(MessageType.Entity, em.serializeEntity(blockEntity));
        }
        em.addComponent(entity, inventory);

        em.addComponent(entity, new CurrentPlayerComponent()); // Treat as current player. A temporary way to signalize that this is the player to control.
        em.addComponent(entity, new WallCollisionComponent());
        em.addComponent(entity, new ChunkRequestComponent());
        em.addComponent(entity, new InputComponent()); // Keyboard input

        netComponent.pushBuffer(MessageType.Entity, em.serializeEntity(entity));

        // Deleted as soon as all players have been informed of this new player.
        // Not serializable, and not sent to client, so add it after the rest of the player entity has been serialized,
        // and pushed to netComponent.
        em.addComponent(entity, new NewPlayerComponent());
    }
}