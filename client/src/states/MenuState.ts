import HTMLParser from "../../lib/HTMLParser";
import {State} from "./State";
import PlayState from "./PlayState";

import '../../assets/stylesheets/menu.scss';
import AssetManager from "../../lib/AssetManager";
let Modernizr = require('../.modernizrrc');

const html = `
    <div id="mainmenu">
        <div class="warning" style="display: none">
            Your browser has poor support for some technologies used in this game.
            It may still be playable, but please consider upgrading your browser.
        </div>
        <div class="error" style="display: none">
            Your browser does not support all the technologies required to play this game,
            and it will most likely not work. Please upgrade your browser.
        </div>
        <ul>
            <li>
                <span>Player name:</span>
                <input type="text" class="input" id="name" placeholder="Name">
            </li>
    
            <li>
                <span>Server:</span>
                <input type="text" class="input" id="server" placeholder="Server address and port">
            </li>
    
            <li>
                <button id="play" class="button">Join server</button>
            </li>
        </ul>
    </div>
`;


export default class MenuState extends State {
    private assetManager: AssetManager;

    private menuNode: Element;
    private playerName: string;
    private serverAddress: string;

    constructor(assetManager: AssetManager) {
        super();

        // Keep reference to pass to play state.
        this.assetManager = assetManager;

        let parser = new HTMLParser();
        this.menuNode = parser.parse(html);
    }

    onEnter() {
        this.checkBrowserSupport();
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
            return new PlayState(this.assetManager, this.serverAddress);
        }
        return null;
    }

    private checkBrowserSupport() {
        let hasErrors = !Modernizr.canvas || !Modernizr.dataview || !Modernizr.es6math || !Modernizr.performance || !Modernizr.pointerlock || !Modernizr.postmessage || !Modernizr.webgl || !Modernizr.websockets || !Modernizr.webworkers;
        let hasWarnings = !Modernizr.cssanimations || !Modernizr.cssvwunit || !Modernizr.flexbox || !Modernizr.fullscreen || !Modernizr.audio;

        if(hasErrors) {
            (this.menuNode.querySelector('.error') as HTMLDivElement).style.display = 'block';
        } else if (hasWarnings) {
            (this.menuNode.querySelector('.warning') as HTMLDivElement).style.display = 'block';
        }
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