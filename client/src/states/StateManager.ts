import {WebGLRenderer} from 'three';
import {State} from "./State";
import AssetManager from "../../lib/AssetManager";

class Settings {
    private _soundVolume: number;
    private _musicVolume: number;
    private _antialias: boolean;

    get soundVolume() {
        return this._soundVolume;
    }

    get musicVolume() {
        return this._soundVolume;
    }

    get antialias() {
        return this._soundVolume;
    }

    constructor() {
        let json = JSON.parse(localStorage.getItem('settings') || '{}');
        this._soundVolume = json['soundVolume'] || 0.5;
        this._musicVolume = json['musicVolume'] || 0.5;
        this._antialias = json['antialias'] || false;
    }

    set(key: string, value: any) {
        if(!this.hasOwnProperty(key)) return;
        this[key] = value;

        localStorage.setItem('settings', JSON.stringify(this));
    }
}

export default class StateManager {
    private state: State;
    private nextState: State;
    private currentTime: number = performance.now();

    assetManager: AssetManager = new AssetManager();
    renderer: WebGLRenderer = new WebGLRenderer({
        antialias: false // TODO: Handle in a settings menu.
    });

    settings: Settings = new Settings();

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


