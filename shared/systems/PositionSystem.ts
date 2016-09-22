import {System} from "../systems";
import {ComponentId} from "../constants";
import {PhysicsComponent, PositionComponent} from "../components";


export default class PositionSystem extends System {
    update(dt: number): any {
        this.entityManager.getEntities(ComponentId.Physics).forEach((component, entity) => {
            // Get physics.
            let physComponent = component as PhysicsComponent;

            // Update positions.
            let posComponent = this.entityManager.getComponent(entity, ComponentId.Position) as PositionComponent;
            posComponent.x += physComponent.velX;
            posComponent.y += physComponent.velY;
            posComponent.z += physComponent.velZ;
        })
    }
}