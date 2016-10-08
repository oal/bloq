import Initializer from "./Initializer";
import {ComponentId} from "../../../shared/constants";


export default class InputInitializer extends Initializer {
    initialize(entity: string, components: Object) {
        Object.keys(components).forEach((componentTypeStr) => {
            let componentType = parseInt(componentTypeStr) as ComponentId;
            let componentData = components[componentType];
            this.entityManager.addComponentFromObject(entity, componentType, componentData);
        });
    }
}