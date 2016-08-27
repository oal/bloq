import EntityManager from "../../shared/EntityManager";
import {InputComponent, PositionComponent, PlayerComponent} from "../../shared/components";


export function initPlayerEntity(em: EntityManager, entity: string) {
    em.addComponent(entity, new InputComponent(true));
    em.addComponent(entity, new PositionComponent());
    em.addComponent(entity, new PlayerComponent());
}