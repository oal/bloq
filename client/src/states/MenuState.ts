import HTMLParser from "../../lib/HTMLParser";
import '../../assets/stylesheets/menu.scss';
import {State} from "./State";
import PlayState from "./PlayState";

const html = `
    <div id="mainmenu">
        <ul>
            <li>
                <span>Player name:</span>
                <input type="text" id="name" placeholder="Name">
            </li>
    
            <li>
                <span>Server:</span>
                <input type="text" id="server" placeholder="Server address and port">
            </li>
    
            <li>
                <button id="play">Join server</button>
            </li>
        </ul>
    </div>
`;


export default class MenuState extends State {
    private menuNode: Element;
    private playerName: string;
    private serverAddress: string;

    constructor() {
        super();
        let parser = new HTMLParser();
        this.menuNode = parser.parse(html);
    }

    onEnter() {
        document.body.appendChild(this.menuNode);

        let nameInput = (this.menuNode.querySelector('#name') as HTMLInputElement);
        nameInput.value = localStorage.getItem('name') || `Player${Math.round(Math.random() * 100000)}`;
        (this.menuNode.querySelector('#server') as HTMLInputElement).value = `${location.hostname}:8081`;

        this.menuNode.querySelector('#play').addEventListener('click', this.join.bind(this));
    }

    onExit() {
        document.body.removeChild(this.menuNode);
    }

    tick(dt: number): State|null {
        if (this.playerName && this.serverAddress) {
            return new PlayState(this.serverAddress);
        }
        return null;
    }

    private join() {
        let name = (this.menuNode.querySelector('#name') as HTMLInputElement).value;
        if (name.length === 0) return;
        localStorage.setItem('name', name);

        let serverAddress = (this.menuNode.querySelector('#server') as HTMLInputElement).value;
        if (serverAddress.length === 0) return;

        this.playerName = name;
        this.serverAddress = serverAddress;
    }
}