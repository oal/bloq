import EntityManager from "./EntityManager";
import {PositionComponent, InputComponent, YawComponent, PhysicsComponent, WallCollisionComponent} from "./components";


export function updateMovement(em: EntityManager, dt) {
    em.getEntities('physics').forEach((component, entity) => {
        let input = em.getComponent(entity, 'input') as InputComponent;

        let yaw = em.getComponent(entity, 'yaw') as YawComponent;
        let rotation = yaw.rot;

        let physComponent = component as PhysicsComponent;
        physComponent.setDirty(false);

        let speed = dt * 4;
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
            physComponent.velY = 0.25;
            em.removeComponentType(entity, 'onground');
            physComponent.setDirty(true);
        }

        // Are we colliding with a block in the world? If so, allow no more movement in that direction.
        let blockCollision = em.getComponent(entity, 'wallcollision') as WallCollisionComponent;
        if (blockCollision.px && physComponent.velX > 0) physComponent.velX = 0;
        if (blockCollision.nx && physComponent.velX < 0) physComponent.velX = 0;
        if (blockCollision.pz && physComponent.velZ > 0) physComponent.velZ = 0;
        if (blockCollision.nz && physComponent.velZ < 0) physComponent.velZ = 0;
    })
}


export function updatePhysics(em: EntityManager, dt) {
    em.getEntities('physics').forEach((component, entity) => {
        // Update physics.
        let physComponent = component as PhysicsComponent;

        physComponent.velY -= dt * 2;
        if (physComponent.velY < -1) physComponent.velY = -1;

        // TODO: Should use delta time here somewhere.
        physComponent.velX *= 30 * dt;
        physComponent.velZ *= 30 * dt;
    })
}

export function updatePositions(em: EntityManager, dt) {
    em.getEntities('physics').forEach((component, entity) => {
        // Get physics.
        let physComponent = component as PhysicsComponent;

        // Update positions.
        let posComponent = em.getComponent(entity, 'position') as PositionComponent;
        posComponent.x += physComponent.velX;
        posComponent.y += physComponent.velY;
        posComponent.z += physComponent.velZ;
        posComponent.setDirty(true);
    })
}