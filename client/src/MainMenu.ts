import Game from "./Game";
import HTMLParser from "./HTMLParser";
import '../assets/stylesheets/menu.scss';


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

export default class MainMenu {
    private menuNode: Element;
    constructor() {
        let parser = new HTMLParser();
        this.menuNode = parser.parse(html);
        document.body.appendChild(this.menuNode);

        this.init();
        this.registerEvents();
    }

    init() {
        let nameInput = (this.menuNode.querySelector('#name') as HTMLInputElement);
        nameInput.value = localStorage.getItem('name') || `Player${Math.round(Math.random() * 100000)}`;
        (this.menuNode.querySelector('#server') as HTMLInputElement).value = `${location.hostname}:8081`;
    }

    registerEvents() {
        this.menuNode.querySelector('#play').addEventListener('click', this.play.bind(this));
    }

    play() {
        let name = (this.menuNode.querySelector('#name') as HTMLInputElement).value; // TODO: Use this.
        if (name.length === 0) return;
        localStorage.setItem('name', name);

        let serverAddress = (this.menuNode.querySelector('#server') as HTMLInputElement).value;
        if (serverAddress.length === 0) return;

        (this.menuNode as HTMLDivElement).style.display = 'none';
        new Game(serverAddress);
    }
}