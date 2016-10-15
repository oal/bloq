import EntityManager from "../../shared/EntityManager";
import {
    InputComponent, PositionComponent,
    CurrentPlayerComponent, PhysicsComponent, RotationComponent, WallCollisionComponent, InventoryComponent,
    BlockComponent, ChunkRequestComponent
} from "../../shared/components";
import {
    NetworkComponent, NewPlayerComponent, PlayerComponent, PickableComponent
} from "./components";
import {BlockId} from "../../shared/constants";
import Server from "./Server";


export function initPlayerEntity(em: EntityManager, entity: string, ws: WebSocket) {
    let net = new NetworkComponent();
    net.websocket = ws;
    em.addComponent(entity, net); // Keyboard input
    em.addComponent(entity, new InputComponent()); // Keyboard input

    let pos = new PositionComponent();
    pos.y = 15;
    pos.x = 5;
    pos.z = 5;
    em.addComponent(entity, pos); // Position tracking

    em.addComponent(entity, new PhysicsComponent());
    em.addComponent(entity, new RotationComponent());

    let inventory = new InventoryComponent();
    for (let i = 0; i < 10; i++) {
        let entity = em.createEntity();
        let block = new BlockComponent();
        block.kind = i + 1;
        block.count = 1;

        em.addComponent(entity, block);
        let pos = new PositionComponent();
        pos.y = 15;
        pos.x = 5;
        pos.z = 5;
        em.addComponent(entity, pos);

        inventory.slots[i] = entity;
        Server.sendEntity(net, em.serializeEntity(entity));
    }
    em.addComponent(entity, inventory);

    em.addComponent(entity, new PlayerComponent()); // Treat as player / render as player? WIP
    em.addComponent(entity, new CurrentPlayerComponent()); // Treat as current player. A temporary way to signalize that this is the player to control.
    em.addComponent(entity, new NewPlayerComponent()); // Deleted as soon as all players have been informed of this new player
    em.addComponent(entity, new WallCollisionComponent()); // For wall collisions.

    em.addComponent(entity, new ChunkRequestComponent())
}

export function initBlockEntity(em: EntityManager, x: number, y: number, z: number, kind: BlockId): string {
    let blockEntity = em.createEntity();
    let pos = new PositionComponent();
    pos.x = x;
    pos.y = y;
    pos.z = z;

    let block = new BlockComponent();
    block.kind = kind;
    em.addComponent(blockEntity, pos);
    em.addComponent(blockEntity, block);
    em.addComponent(blockEntity, new PickableComponent());

    return blockEntity;
}