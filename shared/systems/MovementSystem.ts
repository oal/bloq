import {System} from "../systems";
import {ComponentId} from "../constants";
import {
    InputComponent, RotationComponent, PhysicsComponent, OnGroundComponent,
    WallCollisionComponent
} from "../components";


export default class MovementSystem extends System {
    update(dt: number): any {
        this.entityManager.getEntities(ComponentId.Physics).forEach((component, entity) => {
            let input = this.entityManager.getComponent(entity, ComponentId.Input) as InputComponent;

            let rotation = this.entityManager.getComponent(entity, ComponentId.Rotation) as RotationComponent;

            let physComponent = component as PhysicsComponent;

            let speed = dt * 4;
            let sinSpeed = Math.sin(rotation.y) * speed;
            let cosSpeed = Math.cos(rotation.y) * speed;
            if (input.moveForward) {
                physComponent.velX -= sinSpeed;
                physComponent.velZ -= cosSpeed;
            }
            if (input.moveLeft) {
                physComponent.velX -= cosSpeed;
                physComponent.velZ += sinSpeed;
            }
            if (input.moveRight) {
                physComponent.velX += cosSpeed;
                physComponent.velZ -= sinSpeed;
            }
            if (input.moveBackward) {
                physComponent.velX += sinSpeed;
                physComponent.velZ += cosSpeed;
            }
            if (input.jump) {
                let onGround = this.entityManager.getComponent(entity, ComponentId.OnGround) as OnGroundComponent;
                if (onGround && onGround.canJump) {
                    physComponent.velY = 0.25;
                    this.entityManager.removeComponentType(entity, ComponentId.OnGround);
                }
            }

            // Are we colliding with a block in the world? If so, allow no more movement in that direction.
            let blockCollision = this.entityManager.getComponent(entity, ComponentId.WallCollision) as WallCollisionComponent;
            if (blockCollision.px && physComponent.velX > 0) physComponent.velX = 0;
            if (blockCollision.nx && physComponent.velX < 0) physComponent.velX = 0;
            if (blockCollision.pz && physComponent.velZ > 0) physComponent.velZ = 0;
            if (blockCollision.nz && physComponent.velZ < 0) physComponent.velZ = 0;
        })
    }
}