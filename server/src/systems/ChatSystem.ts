import {System} from "../../../shared/System";
import {ComponentId} from "../../../shared/constants";
import {ChatMessageComponent} from "../../../shared/components";


export default class ChatSystem extends System {
    update(dt: number): void {
        this.entityManager.getEntities(ComponentId.ChatMessage).forEach((component, entity) => {
            let msgComponent = component as ChatMessageComponent;

            console.log('Chat message from', entity, msgComponent.text);

            this.entityManager.removeComponent(entity, msgComponent);
        })
    }
}