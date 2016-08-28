import {PositionComponent, YawComponent} from "../../shared/components"
import EntityManager from "../../shared/EntityManager";


export function updatePlayerInput(em: EntityManager, playerEntity, obj) {
    let input = obj.components['input'];
    let existingInput = em.getComponent(playerEntity, 'input');
    existingInput.update(input);

    let position = obj.components['position'];
    let existingPosition = em.getComponent(playerEntity, 'position') as PositionComponent;
    let dist = Math.sqrt(Math.pow(position.x - existingPosition.x, 2) + Math.pow(position.y - existingPosition.y, 2) + Math.pow(position.z - existingPosition.z, 2));

    existingPosition.update(position);
    if (dist > 0.5) {
        // TODO: Send correction to client.
        console.log('Too big difference between client and server!', dist);
    }
}

export function updatePlayerYaw(em: EntityManager, playerEntity, obj) {
    let yaw = obj.components['yaw'];
    let existingYaw = em.getComponent(playerEntity, 'yaw') as YawComponent;
    existingYaw.update(yaw);
}