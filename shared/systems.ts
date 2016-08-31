import EntityManager from "./EntityManager";
import {PositionComponent, InputComponent, YawComponent, PhysicsComponent} from "./components";


export function updateMovement(em: EntityManager, dt) {
    em.getEntities('physics').forEach((component, entity) => {
        let input = em.getComponent(entity, 'input') as InputComponent;

        let yaw = em.getComponent(entity, 'yaw') as YawComponent;
        let rotation = yaw.rot;

        let physComponent = component as PhysicsComponent;
        physComponent.setDirty(false);

        let speed = dt * 7.5;
        let sinSpeed = Math.sin(rotation) * speed;
        let cosSpeed = Math.cos(rotation) * speed;
        if (input.moveForward) {
            physComponent.velX -= sinSpeed;
            physComponent.velZ -= cosSpeed;
            physComponent.setDirty(true);
        }
        if (input.moveLeft) {
            physComponent.velX -= cosSpeed;
            physComponent.velZ += sinSpeed;
            physComponent.setDirty(true);
        }
        if (input.moveRight) {
            physComponent.velX += cosSpeed;
            physComponent.velZ -= sinSpeed;
            physComponent.setDirty(true);
        }
        if (input.moveBackward) {
            physComponent.velX += sinSpeed;
            physComponent.velZ += cosSpeed;
            physComponent.setDirty(true);
        }
        if (input.jump && em.getComponent(entity, 'onground')) {
            physComponent.velY = 2.0;
            em.removeComponentType(entity, 'onground');
            physComponent.setDirty(true);
        }
    })
}


export function updatePhysics(em: EntityManager, dt) {
    em.getEntities('physics').forEach((component, entity) => {
        // Update physics.
        let physComponent = component as PhysicsComponent;

        physComponent.velY *= 0.9;
        physComponent.velY -= dt * 5;

        // TODO: Should use delta time here somewhere.
        physComponent.velX *= 0.5;
        physComponent.velZ *= 0.5;

        // Update positions.
        let posComponent = em.getComponent(entity, 'position') as PositionComponent;
        posComponent.x += physComponent.velX;
        posComponent.y += physComponent.velY;
        posComponent.z += physComponent.velZ;
        posComponent.setDirty(true);
    })
}

