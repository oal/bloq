import {WebGLRenderer} from 'three';
import {State} from "./State";
import AssetManager from "../../lib/AssetManager";


let settingsProxyHandler = {
    set: (obj, prop, value) => {
        if (obj[prop] !== value) {
            obj[prop] = value;
            localStorage.setItem('settings', JSON.stringify(obj));
        }
        return true;
    }
};

class Settings {
    antialias: boolean;
    musicVolume: number;
    private _soundVolume: number;

    get soundVolume() {
        return this._soundVolume;
    }
    set soundVolume(vol) {
        this._soundVolume = vol;
        this.gain.gain.value = this.soundVolume;
    }

    private audioContext: AudioContext;
    private gain: GainNode;

    constructor(audioContext: AudioContext, gain: GainNode) {
        this.audioContext = audioContext;
        this.gain = gain;

        // Parse existing config, and init values.
        let json = JSON.parse(localStorage.getItem('settings') || '{}');
        this.antialias = json['antialias'] || false;

        // If undefined, will be NaN and default is set, otherwise, set to stored volume.
        let soundVolume = json['soundVolume'];
        this.soundVolume = soundVolume+1 ? soundVolume : 0.5;

        let musicVolume = json['musicVolume'];
        this.musicVolume = musicVolume+1 ? musicVolume : 0.5;
    }
}

export default class StateManager {
    private state: State;
    private nextState: State;
    private currentTime: number = performance.now();

    assetManager: AssetManager;
    renderer: WebGLRenderer;

    settings: Settings;

    constructor() {
        // One audio context and gain node is passed to all sounds.
        let audioContext = new AudioContext();
        let gain = audioContext.createGain();
        gain.connect(audioContext.destination);

        // Asset manager and settings object need these.
        this.assetManager = new AssetManager(audioContext, gain);
        this.settings = new Proxy(new Settings(audioContext, gain), settingsProxyHandler);

        this.renderer = new WebGLRenderer({
            antialias: this.settings.antialias
        });

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


