import EntityManager from "./EntityManager";
import {PositionComponent} from "./components";

export function update_movement(em: EntityManager) {
    em.getEntities('position').forEach((component, entity) => {
        (component as PositionComponent).x += 1.0;
    })
}