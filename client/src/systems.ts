import * as Keymaster from 'keymaster';
import {Scene} from 'three';

import EntityManager from "../../shared/EntityManager";
import {InputComponent, PositionComponent} from "../../shared/components";
import Server from "./Server";
import {MeshComponent} from "./components";


export function updateKeyboard(em: EntityManager) {
    em.getEntities('input').forEach((component, entity) => {
        let input = component as InputComponent;

        let moveForward = Keymaster.isPressed('W'.charCodeAt(0));
        let moveLeft = Keymaster.isPressed('A'.charCodeAt(0));
        let moveRight = Keymaster.isPressed('D'.charCodeAt(0));
        let moveBackward = Keymaster.isPressed('S'.charCodeAt(0));

        if (moveForward !== input.moveForward) {
            input.moveForward = moveForward;
            input.setDirty(true);
        }
        if (moveLeft !== input.moveLeft) {
            input.moveLeft = moveLeft;
            input.setDirty(true);
        }
        if (moveRight !== input.moveRight) {
            input.moveRight = moveRight;
            input.setDirty(true);
        }
        if (moveBackward !== input.moveBackward) {
            input.moveBackward = moveBackward;
            input.setDirty(true);
        }
    })
}

export function syncPlayer(em: EntityManager, server: Server) {
    em.getEntities('player').forEach((component, entity) => {
        let position = em.getComponent(entity, 'position');
        let input = em.getComponent(entity, 'input');

        if (input.isDirty()) {
            server.send({
                entity: entity,
                components: {
                    position: position,
                    input: input,
                }
            });
            input.setDirty(false);
        }
    })
}

export function updateMeshes(em: EntityManager, scene: Scene) {
    em.getEntities('mesh').forEach((component, entity) => {
        let component = component as MeshComponent;
        let position = em.getComponent(entity, 'position') as PositionComponent;

        if(!component.mesh.parent) {
            scene.add(component.mesh);
        }
        component.mesh.position.x = position.x;
        component.mesh.position.y = position.y;
        component.mesh.position.z = position.z;
    })
}