import EntityManager from "./EntityManager";
import {PositionComponent, InputComponent, YawComponent} from "./components";

export function updateMovement(em: EntityManager, dt) {
    em.getEntities('position').forEach((component, entity) => {
        let input = em.getComponent(entity, 'input') as InputComponent;

        let yaw = em.getComponent(entity, 'yaw') as YawComponent;
        let rotation = yaw.rot;

        let pos = (component as PositionComponent);
        pos.setDirty(false);

        if (input.moveForward) {
            pos.x -= Math.sin(rotation) * dt * 4;
            pos.z -= Math.cos(rotation) * dt * 4;
            pos.setDirty(true);
        }
        if (input.moveLeft) {
            pos.x -= Math.cos(rotation) * dt * 4;
            pos.z += Math.sin(rotation) * dt * 4;
            pos.setDirty(true);
        }
        if (input.moveRight) {
            pos.x += Math.cos(rotation) * dt * 4;
            pos.z -= Math.sin(rotation) * dt * 4;
            pos.setDirty(true);
        }
        if (input.moveBackward) {
            pos.x += Math.sin(rotation) * dt * 4;
            pos.z += Math.cos(rotation) * dt * 4;
            pos.setDirty(true);
        }
        /*if(pos.isDirty()) {
            console.log(`Pos updated: ${pos.x} : ${pos.y} : ${pos.z}`)
        }*/
    })
}