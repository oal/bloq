import AssetManager from "../../lib/AssetManager";
import {Server} from "../Server";
import World from "../World";
import {WebGLRenderer} from 'three';
import Stats = require('stats.js');
import {State} from "./State";

// Debug performance. TODO: Should go in DebugTextSystem.
var stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const enum GameState {
    Active,
    Inactive
}

export default class PlayState extends State {
    state: GameState = GameState.Inactive;

    assetManager: AssetManager;

    world: World;
    serverAddress: string; // TODO: Create Server instance in constructor, but don't connect until onEnter.
    server: Server;

    renderer: WebGLRenderer;
    isRunning: boolean = false;

    constructor(server: string) {
        super();
        this.serverAddress = server;
    }

    onEnter() {
        this.loadAssets(() => {
            this.server = new Server(this, this.serverAddress, () => {
                this.initRenderer();
                this.world = new World(this);
                this.isRunning = true;

                // let m = this.assetManager.getMusic('music');
                // m.loop = true;
                // m.volume = 0.25;
                // m.play();
            });
        });
    }

    onExit() {
        // Possibly cleanup. We never leave the PlayState at the moment, though.
    }

    tick(dt: number): State|null {
        if (!this.isRunning) return null;

        stats.begin();
        this.world.tick(dt);
        stats.end();

        // Render
        this.renderer.render(this.world.scene, this.world.camera);
        return null;
    }

    // Init
    initRenderer() {
        this.renderer = new WebGLRenderer({
            antialias: false // TODO: Handle in a settings menu.
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xBFF0FF);

        document.body.appendChild(this.renderer.domElement);
        this.registerEvents();
    }

    loadAssets(callback: Function) {
        let assets = new AssetManager();
        assets.addTexture('terrain', require('../../assets/textures.png'));
        assets.addTexture('player', require('../../assets/player.png'));

        assets.addMesh('player', require('../../assets/player.json'));

        assets.addMusic('music', require('file!../../assets/sound/music.ogg'));

        assets.addSound('walk', require('file!../../assets/sound/walk.ogg'));
        assets.addSound('dig', require('file!../../assets/sound/dig.ogg'));
        assets.addSound('pickup', require('file!../../assets/sound/pickup.ogg'));

        assets.load(progress => {
            // TODO: Show loading progress in GUI.
            console.log(progress);

            // Continue setup when everything is loaded.
            if (progress === 1) callback();
        });

        this.assetManager = assets;
    }


    // Events
    private registerEvents() {
        // Show darkened overlay when game is not in focus.
        let overlay = document.getElementById('overlay');
        overlay.onclick = () => {
            let canvas = this.renderer.domElement;
            canvas.requestPointerLock = canvas.requestPointerLock || (canvas as any).mozRequestPointerLock;
            if (canvas.requestPointerLock) canvas.requestPointerLock();
        };

        let registerEvent = (eventName, method, target?) => (target || document).addEventListener(eventName, method.bind(this), false);
        registerEvent('resize', this.onResize, window);
        registerEvent('pointerlockchange', this.onPointerLockChange);
    }

    private onPointerLockChange(event: Event) {
        let overlay = document.getElementById('overlay');

        let canvas = this.renderer.domElement;
        if (document.pointerLockElement === canvas || (document as any).mozPointerLockElement === canvas) {
            this.state = GameState.Active;
            overlay.style.display = 'none';
        } else {
            this.state = GameState.Inactive;
            overlay.style.display = 'block';
        }
    }

    private onResize(event: Event) {
        let width = window.innerWidth;
        let height = window.innerHeight;

        this.world.camera.aspect = width / height;
        this.world.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height, true);
    }
}