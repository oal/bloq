import EntityManager from "./EntityManager";
import {PositionComponent} from "./components";

export function update_movement(em: EntityManager, dt) {
    em.getEntities('position').forEach((component, entity) => {
        (component as PositionComponent).x += 1.0*dt;
        component.setDirty();
    })
}