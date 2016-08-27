import EntityManager from "./EntityManager";
import {PositionComponent, InputComponent} from "./components";

export function updateMovement(em: EntityManager, dt) {
    em.getEntities('position').forEach((component, entity) => {
        let input = em.getComponent(entity, 'input') as InputComponent;
        let pos = (component as PositionComponent);
        if (input.moveForward) {
            pos.z -= dt;
        }
        if (input.moveLeft) {
            pos.x -= dt;
        }
        if (input.moveRight) {
            pos.x += dt;
        }
        if (input.moveBackward) {
            pos.z += dt;
        }
        
        component.setDirty();
    })
}