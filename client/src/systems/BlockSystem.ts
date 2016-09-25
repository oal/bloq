import {System} from "../../../shared/systems";
import {ComponentId} from "../../../shared/constants";
import {RotationComponent, PositionComponent, InventoryComponent} from "../../../shared/components";


export default class BlockSystem extends System {
    time: number = 0;
    update(dt: number) {
        this.entityManager.getEntities(ComponentId.Block).forEach((component, entity) => {
            let rotComponent = this.entityManager.getComponent(entity, ComponentId.Rotation) as RotationComponent;
            rotComponent.x += dt / 2.0;
            rotComponent.y += dt;

            let posComponent = this.entityManager.getComponent(entity, ComponentId.Position) as PositionComponent;
            posComponent.y += Math.sin(this.time*1.5)/250.0;
        });
        this.time += dt;
    }
}