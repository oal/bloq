import {Scene} from 'three';

import {System} from "../../../shared/systems";
import EntityManager from "../../../shared/EntityManager";
import {ComponentId} from "../../../shared/constants";
import {PlayerComponent} from "../components";
import {PositionComponent, RotationComponent, PhysicsComponent} from "../../../shared/components";


export default class PlayerMeshSystem extends System {
    scene: Scene;

    constructor(em: EntityManager, scene: Scene) {
        super(em);
        this.scene = scene;
    }

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.Player).forEach((component, entity) => {
            let playerComponent = component as PlayerComponent;
            let mesh = playerComponent.mesh;

            if (!mesh.parent) {
                this.scene.add(mesh);
            }

            let position = this.entityManager.getComponent(entity, ComponentId.Position) as PositionComponent;
            mesh.position.x = position.x;
            mesh.position.y = position.y;
            mesh.position.z = position.z;

            let rot = this.entityManager.getComponent(entity, ComponentId.Rotation) as RotationComponent;
            mesh.rotation.y = rot.y;

            if (this.entityManager.getComponent(entity, ComponentId.CurrentPlayer)) {
                mesh.getObjectByName('camera').rotation.x = rot.x;
            } else {
                // Animation is only relevant for other players, as current player has no mesh.
                let physComponent = this.entityManager.getComponent(entity, ComponentId.Physics) as PhysicsComponent;
                if (Math.abs(physComponent.velX) > 0.01 || Math.abs(physComponent.velZ) > 0.01) {
                    if (mesh.getCurrentAnimation() != 'walk') {
                        mesh.playAnimation('walk');
                    }
                } else {
                    mesh.playAnimation('idle');
                }
                playerComponent.mesh.mixer.update(dt);
            }

        })
    }
}