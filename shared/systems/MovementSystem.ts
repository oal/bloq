import {System} from "../systems";
import {ComponentId} from "../constants";
import {
    InputComponent, RotationComponent, PhysicsComponent, OnGroundComponent,
    WallCollisionComponent
} from "../components";


export default class MovementSystem extends System {
    update(dt: number): any {
        this.entityManager.getEntities(ComponentId.Physics).forEach((component, entity) => {
            if(!this.entityManager.hasComponent(entity, ComponentId.Player)) return;

            let input = this.entityManager.getComponent<InputComponent>(entity, ComponentId.Input);

            let rotation = this.entityManager.getComponent<RotationComponent>(entity, ComponentId.Rotation);

            let physComponent = component as PhysicsComponent;

            let speed = dt * 6;
            let sinSpeed = Math.sin(rotation.y) * speed;
            let cosSpeed = Math.cos(rotation.y) * speed;

            physComponent.velX = 0;
            physComponent.velZ = 0;
            if (input.moveForward) {
                physComponent.velX -= sinSpeed;
                physComponent.velZ -= cosSpeed;
            }
            if (input.moveLeft) {
                physComponent.velX -= cosSpeed/1.5;
                physComponent.velZ += sinSpeed/1.5;
            }
            if (input.moveRight) {
                physComponent.velX += cosSpeed/1.5;
                physComponent.velZ -= sinSpeed/1.5;
            }
            if (input.moveBackward) {
                physComponent.velX += sinSpeed;
                physComponent.velZ += cosSpeed;
            }
            if (input.jump) {
                let onGround = this.entityManager.getComponent<OnGroundComponent>(entity, ComponentId.OnGround);
                if (onGround && onGround.canJump) {
                    physComponent.velY = 0.25;
                    this.entityManager.removeComponentType(entity, ComponentId.OnGround);
                }
            }

            // Are we colliding with a block in the world? If so, allow no more movement in that direction.
            let blockCollision = this.entityManager.getComponent<WallCollisionComponent>(entity, ComponentId.WallCollision);
            if (blockCollision.px && physComponent.velX > 0) physComponent.velX = 0;
            if (blockCollision.nx && physComponent.velX < 0) physComponent.velX = 0;
            if (blockCollision.pz && physComponent.velZ > 0) physComponent.velZ = 0;
            if (blockCollision.nz && physComponent.velZ < 0) physComponent.velZ = 0;
        })
    }
}