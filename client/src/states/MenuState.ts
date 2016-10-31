import HTMLParser from "../../lib/HTMLParser";
import {State} from "./State";
import PlayState from "./PlayState";
import SettingsState from "./SettingsState";
let Modernizr = require('../.modernizrrc');

import '../../assets/stylesheets/menu.scss';

const html = `
    <div class="menu">
        <div id="mainmenu">
            <div class="warning" style="display: none">
                Your browser has poor support for some technologies used in this game.
                It may still be playable, but please consider upgrading your browser.
            </div>
            <div class="error" style="display: none">
                Your browser does not support all the technologies required to play this game,
                and it will most likely not work. Please upgrade your browser.
            </div>
            <ul class="box animated bounceIn">
                <li>
                    <span>Player name:</span>
                    <input type="text" class="input" id="name" placeholder="Name">
                </li>
        
                <li>
                    <span>Server:</span>
                    <input type="text" class="input" id="server" placeholder="Server address and port">
                </li>
        
                <li>
                    <button class="button btn-join">Join server</button>
                </li>
                
                <li>
                    <button class="button btn-settings">Settings</button>
                </li>
            </ul>
        </div>
    </div>
`;


export default class MenuState extends State {
    private menuNode: Element;

    constructor() {
        super();

        let parser = new HTMLParser();
        this.menuNode = parser.parse(html);
    }

    onEnter() {
        this.checkBrowserSupport();
        document.body.appendChild(this.menuNode);

        let nameInput = (this.menuNode.querySelector('#name') as HTMLInputElement);
        nameInput.value = localStorage.getItem('name') || `Player${Math.round(Math.random() * 100000)}`;
        (this.menuNode.querySelector('#server') as HTMLInputElement).value = `${location.hostname}:8081`;

        this.menuNode.querySelector('.btn-join').addEventListener('click', this.join.bind(this));
        this.menuNode.querySelector('.btn-settings').addEventListener('click', () => {
            this.transitionTo(new SettingsState());
        });

        let m = this.assetManager.getMusic('music');
        m.loop = true;
        m.volume = this.settings.musicVolume;
        m.play();
    }

    onExit() {
        document.body.removeChild(this.menuNode);
    }

    private checkBrowserSupport() {
        let hasErrors = !Modernizr.canvas || !Modernizr.dataview || !Modernizr.es6math || !Modernizr.performance || !Modernizr.pointerlock || !Modernizr.postmessage || !Modernizr.webgl || !Modernizr.websockets || !Modernizr.webworkers;
        let hasWarnings = !Modernizr.cssanimations || !Modernizr.cssvwunit || !Modernizr.flexbox || !Modernizr.fullscreen || !Modernizr.audio;

        if (hasErrors) {
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

        this.transitionTo(new PlayState(serverAddress));
    }
}