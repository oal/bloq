import AssetManager from "../../lib/AssetManager";
import {Server} from "../Server";
import World from "../World";
import {WebGLRenderer} from 'three';
import Stats = require('stats.js');
import {State} from "./State";

// Debug performance.
var stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const enum GameFocus {
    Active,
    Inactive
}

export default class PlayState extends State {
    state: GameFocus = GameFocus.Inactive;

    assetManager: AssetManager;

    world: World;
    server: Server;

    renderer: WebGLRenderer;

    onEnter(context: Object) {
        this.loadAssets(() => {
            this.server = new Server(this, context['server'], () => {
                this.initRenderer();
                this.world = new World(this);

                this.startGameLoop();
            });
        });
    }

    onExit() {
        // Clean up?
    }

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
        assets.load(progress => {
            // TODO: Show loading progress in GUI.
            console.log(progress);

            // Continue setup when everything is loaded.
            if (progress === 1) callback();
        });

        this.assetManager = assets;
    }

    startGameLoop() {
        // Use closure to avoid adding time related stuff to the game object.
        let currentTime = performance.now();
        let update = () => {
            let newTime = performance.now();
            let dt = (newTime - currentTime) / 1000;

            // Process frame
            this.tick(dt);

            // Render
            this.renderer.render(this.world.scene, this.world.camera);

            currentTime = newTime;
            requestAnimationFrame(update);
        };
        update();
    }

    tick(dt: number) {
        stats.begin();
        this.world.tick(dt);
        stats.end();
    }

    // Events
    private registerEvents() {
        // Show darkened overlay when game is not in focus.
        let overlay = document.getElementById('overlay');
        overlay.onclick = () => {
            let canvas = this.renderer.domElement;
            canvas.requestPointerLock = canvas.requestPointerLock || (canvas as any).mozRequestPointerLock;
            canvas.requestPointerLock();
        };

        let registerEvent = (eventName, method, target?) => (target || document).addEventListener(eventName, method.bind(this), false);
        registerEvent('resize', this.onResize, window);
        registerEvent('pointerlockchange', this.onPointerLockChange);
    }

    private onPointerLockChange(event: Event) {
        let overlay = document.getElementById('overlay');

        let canvas = this.renderer.domElement;
        if (document.pointerLockElement === canvas || (document as any).mozPointerLockElement === canvas) {
            this.state = GameFocus.Active;
            overlay.style.display = 'none';
        } else {
            this.state = GameFocus.Inactive;
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