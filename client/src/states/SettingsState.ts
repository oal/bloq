import HTMLParser from "../../lib/HTMLParser";
import {State} from "./State";
import MenuState from "./MenuState";

import '../../assets/stylesheets/settings.scss';

const html = `
    <div class="menu menu-settings">
        <div class="box animated bounceIn">
            <ul>
                <li>
                    <span>Sound effect volume:</span>
                    <input class="settings-sound" type="range" min="0" max="1" step="0.05">
                </li>
        
                <li>
                    <span>Music volume:</span>
                    <input class="settings-music" type="range" min="0" max="1" step="0.05">
                </li>
            </ul>
            <button class="button btn-menu">Return to menu</button>
        </div>
    </div>
`;


export default class SettingsState extends State {
    private guiNode: Element;

    constructor() {
        super();

        let parser = new HTMLParser();
        this.guiNode = parser.parse(html);

        this.guiNode.querySelector('.btn-menu').addEventListener('click', () => {
            this.transitionTo(new MenuState());
        });

        this.registerEvents();
    }

    onEnter() {
        document.body.appendChild(this.guiNode);

        (this.guiNode.querySelector('.settings-music') as HTMLInputElement).value = ''+this.settings.musicVolume;
    }

    onExit() {
        document.body.removeChild(this.guiNode);
    }

    tick(dt: number) {
    }

    private registerEvents() {
        this.guiNode.querySelector('.settings-sound').addEventListener('change', (evt) => {
            this.settings.set('soundVolume', parseFloat((evt.target as HTMLInputElement).value));
        });
        this.guiNode.querySelector('.settings-music').addEventListener('change', (evt) => {
            let musicVolume = parseFloat((evt.target as HTMLInputElement).value);
            this.settings.set('musicVolume', musicVolume);
            this.assetManager.getMusic('music').volume = musicVolume;
        });
    }
}