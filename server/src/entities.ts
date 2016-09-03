import EntityManager from "../../shared/EntityManager";
import {
    InputComponent, PositionComponent,
    CurrentPlayerComponent, PhysicsComponent, RotationComponent, WallCollisionComponent
} from "../../shared/components";
import {NetworkComponent, NewPlayerComponent, PlayerComponent} from "./components";


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
    em.addComponent(entity, new PhysicsComponent()); // Physics tracking
    em.addComponent(entity, new RotationComponent()); // Rotation

    em.addComponent(entity, new PlayerComponent()); // Treat as player / render as player? WIP
    em.addComponent(entity, new CurrentPlayerComponent()); // Treat as current player. A temporary way to signalize that this is the player to control.
    em.addComponent(entity, new NewPlayerComponent()); // Deleted as soon as all players have been informed of this new player
    em.addComponent(entity, new WallCollisionComponent()); // For wall collisions.
}

export function updatePlayerInput(em: EntityManager, playerEntity, obj) {
    let input = obj.components['input'];
    let existingInput = em.getComponent(playerEntity, 'input');
    existingInput.update(input);
    existingInput.setDirty(true);

    let position = obj.components['position'];
    let existingPosition = em.getComponent(playerEntity, 'position') as PositionComponent;
    let dist = Math.sqrt(Math.pow(position.x - existingPosition.x, 2) + Math.pow(position.y - existingPosition.y, 2) + Math.pow(position.z - existingPosition.z, 2));

    existingPosition.update(position);
    if (dist > 0.5) {
        // TODO: Send correction to client.
        console.log('Too big difference between client and server!', dist);
    }
}

export function updatePlayerRotation(em: EntityManager, playerEntity, obj) {
    let rot = obj.components['rotation'];
    let existingRot = em.getComponent(playerEntity, 'rotation') as RotationComponent;
    existingRot.update(rot);
}