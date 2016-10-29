import {WebGLRenderer} from 'three';
import {State} from "./State";
import AssetManager from "../../lib/AssetManager";

export default class StateManager {
    private state: State;
    private nextState: State;
    private currentTime: number = performance.now();

    assetManager: AssetManager = new AssetManager();
    renderer: WebGLRenderer = new WebGLRenderer({
        antialias: false // TODO: Handle in a settings menu.
    });

    constructor() {
        this.update();
        this.registerEvents();
    }

    setState(nextState: State) {
        if (this.state) {
            this.state.onExit();
            this.state.stateManager = null;
        }
        this.nextState = nextState;
        this.nextState.stateManager = this;
    }

    private update() {
        if(this.nextState) {
            this.state = this.nextState;
            this.state.onEnter();
            this.nextState = null;
        }

        if (this.state) {
            let newTime = performance.now();
            let dt = (newTime - this.currentTime) / 1000;

            this.state.tick(dt);
            this.currentTime = newTime;
        }

        requestAnimationFrame(this.update.bind(this));
    }

    private registerEvents() {
        window.addEventListener('resize', evt => {
            if(!this.state) return;
            this.state.onResize(evt);
        }, false);

        document.addEventListener('pointerlockchange', evt => {
            this.state.onPointerLockChange(evt);
        }, false);
    }
}


