import * as Keymaster from 'keymaster';
import EntityManager from "../../shared/EntityManager";
import {InputComponent} from "../../shared/components";
import Server from "./Server";


export function updateKeyboard(em: EntityManager) {
    em.getEntities('input').forEach((component, entity) => {
        let input = component as InputComponent;

        let moveForward = Keymaster.isPressed('W'.charCodeAt(0));
        let moveLeft = Keymaster.isPressed('A'.charCodeAt(0));
        let moveRight = Keymaster.isPressed('D'.charCodeAt(0));
        let moveBackward = Keymaster.isPressed('S'.charCodeAt(0));

        if(moveForward !== input.moveForward) {
            input.moveForward = moveForward
            input.setDirty(true);
        }
        if(moveLeft !== input.moveLeft) {
            input.moveLeft = moveLeft
            input.setDirty(true);
        }
        if(moveRight !== input.moveRight) {
            input.moveRight = moveRight
            input.setDirty(true);
        }
        if(moveBackward !== input.moveBackward) {
            input.moveBackward = moveBackward
            input.setDirty(true);
        }
    })
}

export function updateDirtySyncComponents(em: EntityManager, server: Server) {
    let componentTypes = em.getRegisteredComponentTypes();

    let componentType = componentTypes.next();
    while(!componentType.done) {
        em.getEntities(componentType.value).forEach((component, entity) => {
            if(!component.isSync() || !component.isDirty()) return;

            let data = {};
            data[componentType.value] = component;

            server.send({"entity": entity, "components": data});
            component.setDirty(false);
        });
        componentType = componentTypes.next();
    }
}