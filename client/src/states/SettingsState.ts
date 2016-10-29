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
                    <input type="range" min="0" max="1" step="0.05">
                </li>
        
                <li>
                    <span>Music volume:</span>
                    <input type="range" min="0" max="1" step="0.05">
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
    }

    onEnter() {
        document.body.appendChild(this.guiNode);
    }

    onExit() {
        document.body.removeChild(this.guiNode);
    }

    tick(dt: number) {
    }
}