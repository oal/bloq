import {PositionComponent} from "../../shared/components"
import EntityManager from "../../shared/EntityManager";

export function updatePlayerInput(em: EntityManager, playerEntity, obj) {
    console.log('input!');
    let input = obj.components['input'];
    let position = obj.components['position'];

    let existingInput = em.getComponent(playerEntity, 'input');
    existingInput.update(input);

    let existingPosition = em.getComponent(playerEntity, 'position') as PositionComponent;
    let dist = Math.sqrt(Math.pow(position.x - existingPosition.x, 2) + Math.pow(position.y - existingPosition.y, 2) + Math.pow(position.z - existingPosition.z, 2));

    existingPosition.update(position);
    if (dist > 0.5) {
        // TODO: Send correction to client.
        console.log('Too big difference between client and server!', dist);
    }
}