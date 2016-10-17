import {System} from "../../../shared/System";
import {ComponentId, ChatMaxLength} from "../../../shared/constants";
import {ChatMessageComponent, PositionComponent, PlayerComponent} from "../../../shared/components";
import {broadcastEntity} from "../helpers";


export default class ChatSystem extends System {
    update(dt: number): void {
        this.entityManager.getEntities(ComponentId.ChatMessage).forEach((component, entity) => {
            let posComponent = this.entityManager.getComponent<PositionComponent>(entity, ComponentId.Position);
            if(!posComponent) return;

            let msgComponent = component as ChatMessageComponent;
            if(msgComponent.text.length > ChatMaxLength) msgComponent.text.substr(0, ChatMaxLength);

            console.log('Chat message from', entity, msgComponent.text);

            // Create message as entity, and remove it from player.
            let playerComponent = this.entityManager.getComponent<PlayerComponent>(entity, ComponentId.Player);
            msgComponent.from = playerComponent.name;
            let msgEntity = this.entityManager.createEntity();
            this.entityManager.removeComponent(entity, msgComponent);
            this.entityManager.addComponent(msgEntity, msgComponent);

            broadcastEntity(this.entityManager, posComponent.toChunk(), msgEntity);

            this.entityManager.removeEntity(msgEntity);
        })
    }
}