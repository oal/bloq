import * as Keymaster from 'keymaster';
import EntityManager from "../../shared/EntityManager";
import {InputComponent} from "../../shared/components";


export function updateKeyboard(em: EntityManager) {
    em.getEntities('input').forEach((component, entity) => {
        let input = component as InputComponent;

        input.moveForward = Keymaster.isPressed('W'.charCodeAt(0));
        input.moveLeft = Keymaster.isPressed('A'.charCodeAt(0));
        input.moveRight = Keymaster.isPressed('D'.charCodeAt(0));
        input.moveBackward = Keymaster.isPressed('S'.charCodeAt(0));
    })
}