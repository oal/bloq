import EntityManager from "../../shared/EntityManager";
import {
    InputComponent, PositionComponent,
    CurrentPlayerComponent, PhysicsComponent, RotationComponent, WallCollisionComponent, InventoryComponent,
    BlockComponent
} from "../../shared/components";
import {
    NetworkComponent, NewPlayerComponent, PlayerComponent, ChunkSubscriptionComponent,
    PickableComponent
} from "./components";
import {ComponentId, ActionId, BlockId} from "../../shared/constants";
import {MoveEntityAction} from "../../shared/actions";
import {globalToChunk} from "../../shared/helpers";
import {broadcastAction} from "./helpers";
import {ServerActionManager} from "./actions";
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

    em.addComponent(entity, new ChunkSubscriptionComponent())
}

export function updatePlayerInput(em: EntityManager, am: ServerActionManager, playerEntity: string, obj) {
    let input = obj.components[ComponentId.Input];
    let existingInput = em.getComponent<InputComponent>(playerEntity, ComponentId.Input);
    existingInput.update(input);

    let position = obj.components[ComponentId.Position];
    let existingPosition = em.getComponent<PositionComponent>(playerEntity, ComponentId.Position);
    let prevPos: [number, number, number] = [existingPosition.x, existingPosition.y, existingPosition.z];
    let dist = Math.sqrt(Math.pow(position.x - existingPosition.x, 2) + Math.pow(position.y - existingPosition.y, 2) + Math.pow(position.z - existingPosition.z, 2));

    if (dist < 2) {
        existingPosition.update(position);
    } else {
        console.log('Too big difference between client and server!', dist);
        console.log(playerEntity, prevPos);
        let action = new MoveEntityAction(playerEntity, prevPos);
        am.queueAction(action); // Queue on server as well.

        // Broad cast so it's queued on clients.
        let [cx, cy, cz] = prevPos.map(globalToChunk);
        broadcastAction(em, [cx, cy, cz], ActionId.MoveEntity, action);
    }
}

export function updatePlayerRotation(em: EntityManager, playerEntity, obj) {
    let rot = obj.components[ComponentId.Rotation];
    let existingRot = em.getComponent<RotationComponent>(playerEntity, ComponentId.Rotation);
    existingRot.update(rot);
}

export function updatePlayerInventory(em: EntityManager, playerEntity, obj) {
    let inventoryData = obj.components[ComponentId.Inventory];
    let inventory = em.getComponent<InventoryComponent>(playerEntity, ComponentId.Inventory);

    // Should only trust activeSlot, so the player can't add arbitrary entities to their inventory, and have
    // server accept it.
    inventory.activeSlot = inventoryData.activeSlot;
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