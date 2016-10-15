import {System} from "../System";
import {ComponentId, PlayerJumpVelocity, PlayerSpeed, Gravity, TerminalVelocity} from "../constants";
import {
    PhysicsComponent, RotationComponent, InputComponent, OnGroundComponent,
    WallCollisionComponent
} from "../components";


export default class PhysicsSystem extends System {
    update(dt: number): any {
        this.entityManager.getEntities(ComponentId.Physics).forEach((component, entity) => {
            // Update physics.
            let physComponent = component as PhysicsComponent;
            physComponent.velY -= Gravity * dt;
            if (physComponent.velY < -TerminalVelocity) physComponent.velY = -TerminalVelocity;

            // Maybe this should be in a "PlayerPhysicsSystem".
            if (this.entityManager.hasComponent(entity, ComponentId.Player)) {
                let input = this.entityManager.getComponent<InputComponent>(entity, ComponentId.Input);
                let rotation = this.entityManager.getComponent<RotationComponent>(entity, ComponentId.Rotation);

                let sinSpeed = Math.sin(rotation.y) * PlayerSpeed;
                let cosSpeed = Math.cos(rotation.y) * PlayerSpeed;

                physComponent.velX = 0;
                physComponent.velZ = 0;
                if (input.moveForward) {
                    physComponent.velX -= sinSpeed;
                    physComponent.velZ -= cosSpeed;
                }
                if (input.moveLeft) {
                    physComponent.velX -= cosSpeed / 1.5;
                    physComponent.velZ += sinSpeed / 1.5;
                }
                if (input.moveRight) {
                    physComponent.velX += cosSpeed / 1.5;
                    physComponent.velZ -= sinSpeed / 1.5;
                }
                if (input.moveBackward) {
                    physComponent.velX += sinSpeed / 1.5;
                    physComponent.velZ += cosSpeed / 1.5;
                }
                if (input.jump) {
                    let onGround = this.entityManager.getComponent<OnGroundComponent>(entity, ComponentId.OnGround);
                    if (onGround && onGround.canJump) {
                        physComponent.velY = PlayerJumpVelocity;
                        this.entityManager.removeComponentType(entity, ComponentId.OnGround);
                    }
                }

                let blockCollision = this.entityManager.getComponent<WallCollisionComponent>(entity, ComponentId.WallCollision);
                if (blockCollision.px && physComponent.velX > 0) physComponent.velX = 0;
                if (blockCollision.nx && physComponent.velX < 0) physComponent.velX = 0;
                if (blockCollision.pz && physComponent.velZ > 0) physComponent.velZ = 0;
                if (blockCollision.nz && physComponent.velZ < 0) physComponent.velZ = 0;
            }
        })
    }
}