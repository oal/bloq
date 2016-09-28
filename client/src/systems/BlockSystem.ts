import {System} from "../../../shared/systems";
import {ComponentId} from "../../../shared/constants";
import {RotationComponent} from "../../../shared/components";


export default class BlockSystem extends System {
    time: number = 0;
    update(dt: number) {
        this.entityManager.getEntities(ComponentId.Block).forEach((component, entity) => {
            let rotComponent = this.entityManager.getComponent<RotationComponent>(entity, ComponentId.Rotation);
            rotComponent.x += dt / 2.0;
            rotComponent.y += dt;
        });
        this.time += dt;
    }
}