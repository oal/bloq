import {Server} from "../Server";
import World from "../World";
import {WebGLRenderer} from 'three';
import Stats = require('stats.js');
import {State} from "./State";
import HTMLParser from "../../lib/HTMLParser";
import MenuState from "./MenuState";
import SettingsState from "./SettingsState";

const html = `
    <div id="gui">
        <div id="overlay">
            <div class="overlay-wrapper">
                <div class="overlay-info">
                    <div class="overlay-info-image"></div>
                    <ul>
                        <li>Select blocks: Number keys</li>
                        <li>Move: W/A/S/D</li>
                        <li>Jump: Space</li>
                        <li>Chat: T</li>
                        <li>Dig: Left click</li>
                        <li>Place block: Right click</li>
                    </ul>
                    <h3>Click to start playing</h3>
                </div>
    
                <div class="overlay-buttons">
                    <button class="button btn-settings">Settings</button>
                    <button class="button btn-leave">Leave game</button>
                </div>
            </div>
        </div>
        <div id="crosshair"></div>
    </div>
`;

export default class PlayState extends State {
    private guiNode: Element;
    private stats: Stats;

    world: World;
    private serverAddress: string;
    server: Server;

    renderer: WebGLRenderer;
    private isRunning: boolean = false;

    constructor(server: string) {
        super();

        // Server passed in from menu state.
        this.serverAddress = server;

        let parser = new HTMLParser();
        this.guiNode = parser.parse(html);

        this.guiNode.querySelector('.btn-leave').addEventListener('click', () => {
            this.transitionTo(new MenuState());
        });
        this.guiNode.querySelector('.btn-settings').addEventListener('click', () => {
            this.transitionTo(new SettingsState());
        });

        // Debug performance. TODO: Should go in DebugTextSystem.
        this.stats = new Stats();
        this.stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
        this.guiNode.appendChild(this.stats.dom);
    }

    onEnter() {
        this.server = new Server(this, this.serverAddress, () => {
            this.initRenderer();
            this.world = new World(this, this.guiNode);
            this.isRunning = true;

            document.body.appendChild(this.guiNode);
        });
    }

    onExit() {
        // Remove DOM elements.
        document.body.removeChild(this.guiNode);
        document.body.removeChild(this.renderer.domElement);

        // Disconnect and clean up.
        this.server.close();
    }

    tick(dt: number) {
        if (!this.isRunning) return;

        this.stats.begin();
        this.world.tick(dt);

        // Render
        this.renderer.render(this.world.scene, this.world.camera);
        this.stats.end();
    }

    // Init
    initRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xBFF0FF);

        document.body.appendChild(this.renderer.domElement);
        this.registerCanvasEvents();
    }


    // Events
    private registerCanvasEvents() {
        // Show darkened overlay when game is not in focus.
        (this.guiNode.querySelector('.overlay-info') as HTMLDivElement).onclick = () => {
            let canvas = this.renderer.domElement;
            canvas.requestPointerLock = canvas.requestPointerLock || (canvas as any).mozRequestPointerLock;
            if (canvas.requestPointerLock) canvas.requestPointerLock();
        };
    }

    // Override event handlers on "State".
    onPointerLockChange(event: Event) {
        let overlay = this.guiNode.querySelector('#overlay') as HTMLDivElement;

        let canvas = this.renderer.domElement;
        if (document.pointerLockElement === canvas || (document as any).mozPointerLockElement === canvas) {
            overlay.style.display = 'none';
        } else {
            overlay.style.display = 'flex';
        }
    }

    onResize(event: Event) {
        let width = window.innerWidth;
        let height = window.innerHeight;

        this.world.camera.aspect = width / height;
        this.world.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height, true);
    }
}