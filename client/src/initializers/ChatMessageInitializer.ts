import Initializer from "./Initializer";
import EntityManager from "../../../shared/EntityManager";
import {ComponentId, ChatLogSize, ChatMaxLength} from "../../../shared/constants";



// ChatMessageInitializer doesn't initialize entity in EntityManager, but uses entity data to update DOM.
// We never need to reference this entity again, so therefore we can ignore it.
export default class ChatMessageInitializer extends Initializer {
    private messageLog: HTMLUListElement = document.querySelector('#chat-log') as HTMLUListElement;

    constructor(em: EntityManager) {
        super(em);
    }

    initialize(entity: string, components: Object) {
        let msgData = components[ComponentId.ChatMessage];

        let playerNameEl = document.createElement('strong');
        let playerName = msgData['from'];
        if (playerName.length > 14) playerName = `${playerName.substr(0, 11)}...`;
        playerNameEl.innerText = playerName;

        let msgTextEl = document.createElement('span');
        msgTextEl.innerText = msgData['text'].substr(0, ChatMaxLength);

        let msgEl = document.createElement('li');
        msgEl.appendChild(playerNameEl);
        msgEl.appendChild(msgTextEl);

        if(this.messageLog.children.length > ChatLogSize) {
            this.messageLog.removeChild(this.messageLog.children[ChatLogSize]);
        }

        let firstChild = this.messageLog.children[0];
        if (firstChild) {
            this.messageLog.insertBefore(msgEl, firstChild);
        } else {
            this.messageLog.appendChild(msgEl);
        }
    }
}