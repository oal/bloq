import Initializer from "../../../shared/Initializer";
import {ComponentId} from "../../../shared/constants";
import {InputComponent} from "../../../shared/components";


export default class PlayerInputInitializer extends Initializer {
    initialize(entity: string, components: Object): void {
        let input = components[ComponentId.Input];
        let existingInput = this.entityManager.getComponent<InputComponent>(entity, ComponentId.Input);
        existingInput.update(input);
    }
}