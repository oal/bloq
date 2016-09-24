import {System} from "../../../shared/systems";
import {ComponentId} from "../../../shared/constants";
import {RotationComponent} from "../../../shared/components";


export default class BlockSystem extends System {
    update(dt: number) {
        this.entityManager.getEntities(ComponentId.Block).forEach((component, entity) => {
            let rotComponent = this.entityManager.getComponent(entity, ComponentId.Rotation) as RotationComponent;
            rotComponent.x += dt / 2.0;
            rotComponent.y += dt;
        })
    }
}