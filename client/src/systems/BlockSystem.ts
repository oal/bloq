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
        });
        this.time += dt;
    }
}