import {Vector3} from 'three';

import {System} from "../../../shared/systems";
import {ComponentId} from "../../../shared/constants";
import {RotationComponent, PositionComponent} from "../../../shared/components";


export default class BlockSystem extends System {
    time: number = 0;
    update(dt: number) {
        this.entityManager.getEntities(ComponentId.Block).forEach((component, entity) => {
            let rotComponent = this.entityManager.getComponent<RotationComponent>(entity, ComponentId.Rotation);
            rotComponent.x += dt / 2.0;
            rotComponent.y += dt;

            let posComponent = this.entityManager.getComponent<PositionComponent>(entity, ComponentId.Position);
            posComponent.y += Math.sin(this.time*1.5)/250.0;

            // Does block have lerp component (if it's picked up)?
            // If so, move towards player / target.
            let lerpComponent = this.entityManager.getComponent(entity, ComponentId.LerpPosition);
            if(lerpComponent) {
                let posPlayer = new Vector3(posComponent.x, posComponent.y, posComponent.z);
                let posLerpTo = new Vector3(lerpComponent.x, lerpComponent.y, lerpComponent.z);

                if(posPlayer.distanceTo(posLerpTo) < 0.1) {
                    this.entityManager.removeComponentType(entity, ComponentId.Mesh);
                } else {
                    let lerpTarget = posPlayer.clone().lerp(posLerpTo, 0.2); // dt?
                    posComponent.x = lerpTarget.x;
                    posComponent.y = lerpTarget.y;
                    posComponent.z = lerpTarget.z;
                }
            }


        });
        this.time += dt;
    }
}