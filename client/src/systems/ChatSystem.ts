import {System} from "../../../shared/System";
import KeyboardManager from "../../lib/KeyboardManager";
import EntityManager from "../../../shared/EntityManager";
import {ComponentId, ChatMaxLength} from "../../../shared/constants";
import {ChatMessageComponent} from "../../../shared/components";
import NetworkSystem from "./NetworkSystem";

export default class ChatSystem extends System {
    private messageInput: HTMLInputElement = document.querySelector('#chat-input') as HTMLInputElement;
    private keyboardManager: KeyboardManager;
    private netSystem: NetworkSystem;

    constructor(em: EntityManager, km: KeyboardManager, netSystem: NetworkSystem) {
        super(em);
        this.keyboardManager = km;
        this.netSystem = netSystem;

        this.messageInput.maxLength = ChatMaxLength;
    }

    update(dt: number): void {
        this.entityManager.getEntities(ComponentId.CurrentPlayer).forEach((component, entity) => {
            let messageComponent = this.entityManager.getComponent<ChatMessageComponent>(entity, ComponentId.ChatMessage);

            if (!messageComponent && this.keyboardManager.isPressed('T'.charCodeAt(0))) {
                // Create new ChatMessageComponent, and focus field
                this.entityManager.addComponent(entity, new ChatMessageComponent());

                this.messageInput.disabled = false;
                this.messageInput.focus();
            } else if (messageComponent) {
                // Send by pressing enter
                let messageSent = false;
                if (this.keyboardManager.isPressed(13 /* enter */)) {
                    messageComponent.text = this.messageInput.value;
                    let data = this.entityManager.serializeEntity(entity, [ComponentId.ChatMessage]);
                    this.netSystem.pushBuffer(data);
                    messageSent = true;
                }

                // If sent, or game has lost focus (dark overlay is displayed), reset message box.
                if (messageSent || !document.pointerLockElement) {
                    this.entityManager.removeComponentType(entity, ComponentId.ChatMessage);
                    this.messageInput.value = '';
                    this.messageInput.disabled = true;
                }
            }
        });
    }
}