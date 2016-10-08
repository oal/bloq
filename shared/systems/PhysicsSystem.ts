import {System} from "../systems";
import {ComponentId} from "../constants";
import {PhysicsComponent} from "../components";


export default class PhysicsSystem extends System {
    update(dt: number): any {
        this.entityManager.getEntities(ComponentId.Physics).forEach((component, entity) => {
            // Update physics.
            let physComponent = component as PhysicsComponent;

            physComponent.velY -= dt * 2;
            if (physComponent.velY < -1) physComponent.velY = -1;

            // TODO: Should use delta time here somewhere.
            // physComponent.velX *= 25 * dt;
            // physComponent.velZ *= 25 * dt;
        })
    }
}