import EntityManager from "../../shared/EntityManager";
import {InputComponent, PositionComponent, YawComponent, PlayerComponent} from "../../shared/components";


export function initPlayerEntity(em: EntityManager, entity: string) {
    em.addComponent(entity, new InputComponent()); // Keyboard input
    em.addComponent(entity, new PositionComponent()); // Position tracking
    em.addComponent(entity, new YawComponent()); // Rotation
    em.addComponent(entity, new PlayerComponent()); // Treat as player / render as player? WIP
}