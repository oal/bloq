import Initializer from "../../../shared/Initializer";
import {ComponentId} from "../../../shared/constants";
import {RotationComponent} from "../../../shared/components";


export default class RotationInitializer extends Initializer {
    initialize(entity: string, components: Object): void {
        let rot = components[ComponentId.Rotation];
        let existingRot = this.entityManager.getComponent<RotationComponent>(entity, ComponentId.Rotation);
        existingRot.update(rot);
    }
}