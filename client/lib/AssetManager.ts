import {TextureLoader, JSONLoader, NearestFilter, Texture, MeshBasicMaterial, SkinnedMesh, Mesh} from 'three';
import AnimatedMesh from "./AnimatedMesh";
import Sound from "./Sound";


export default class AssetManager {
    private isLoaded: boolean;
    private filesDone: number = 0;
    private totalFiles: number = 0;
    private textureLoader: TextureLoader = new TextureLoader();
    private meshLoader: JSONLoader = new JSONLoader();
    private audioContext: AudioContext = new AudioContext();

    private queue: {
        textures: Array<[string, string]>,
        meshes: Array<[string, string]>,
        music: Array<[string, string]>,
        sounds: Array<[string, string]>
    };

    private assets: {
        textures: Map<string, Texture>,
        meshes: Map<string, Mesh | AnimatedMesh>,
        music: Map<string, HTMLAudioElement>,
        sounds: Map<string, Sound>
    };

    constructor() {
        this.queue = {
            textures: [],
            meshes: [],
            music: [],
            sounds: [],
        };
        this.assets = {
            textures: new Map<string, Texture>(),
            meshes: new Map<string, Mesh | SkinnedMesh>(),
            music: new Map<string, HTMLAudioElement>(),
            sounds: new Map<string, Sound>()
        };
    }

    addTexture(name: string, url: string) {
        this.queue.textures.push([name, url]);
    }

    addMesh(name: string, url: string) {
        this.queue.meshes.push([name, url]);
    }

    addMusic(name: string, url: string) {
        this.queue.music.push([name, url]);
    }

    addSound(name: string, url: string) {
        this.queue.sounds.push([name, url]);
    }

    private getQueueLength() {
        return this.queue.textures.length + this.queue.meshes.length + this.queue.music.length + this.queue.sounds.length;
    }

    load(callback: Function) {
        if (this.isLoaded) return;

        this.filesDone = 0;
        this.totalFiles = this.getQueueLength() + 1;

        this.loadTextures(callback, () => {
            this.queue.textures = [];
            this.loadMeshes(callback, () => {
                this.queue.meshes = [];
                this.loadMusic(callback, () => {
                    this.queue.music = [];
                    this.loadSounds(callback, () => {
                        this.queue.sounds = [];
                        this.isLoaded = true;
                        callback('complete', 1.0);
                    });
                });
            });
        });
    }

    private loadTextures(progress: Function, done: Function) {
        let filesDone = 0;

        this.queue.textures.forEach(pair => {
            let [name, url] = pair;
            this.textureLoader.load(url, texture => {
                texture.minFilter = NearestFilter;
                texture.magFilter = NearestFilter;
                this.assets.textures.set(name, texture);

                filesDone++;
                this.filesDone++;
                progress('textures', this.filesDone / this.totalFiles);

                if (filesDone == this.queue.textures.length) done();
            });
        });
    }

    private loadMeshes(progress: Function, done: Function) {
        let filesDone = 0;

        this.queue.meshes.forEach(pair => {
            let [name, url] = pair;
            this.meshLoader.load(url, (geometry, materials) => {
                let material = new MeshBasicMaterial({
                    map: this.getTexture(name)
                });
                if (geometry.animations) {
                    material.skinning = true;
                    material.morphTargets = true;
                    this.assets.meshes.set(name, new AnimatedMesh(geometry, material));
                } else {
                    this.assets.meshes.set(name, new Mesh(geometry, material));
                }

                filesDone++;
                this.filesDone++;
                progress('models', this.filesDone / this.totalFiles);

                if (filesDone == this.queue.meshes.length) done();
            });
        });
    }

    private loadMusic(progress: Function, done: Function) {
        let filesDone = 0;

        this.queue.music.forEach(pair => {
            let [name, url] = pair;

            let el = document.createElement('audio');
            el.setAttribute('src', url);
            el.load();
            el.addEventListener('canplaythrough', (evt) => {
                this.assets.music.set(name, el);

                filesDone++;
                this.filesDone++;
                progress('music', this.filesDone / this.totalFiles);

                if (filesDone == this.queue.music.length) done();
            });
        });
    }

    private loadSounds(progress: Function, done: Function) {
        let filesDone = 0;
        let audioCtx = new AudioContext();

        this.queue.sounds.forEach(pair => {
            let [name, url] = pair;
            let req = new XMLHttpRequest();
            req.responseType = 'arraybuffer';
            req.addEventListener('load', () => {
                let data = req.response;
                audioCtx.decodeAudioData(data, (buffer) => {
                    this.assets.sounds.set(name, new Sound(this.audioContext, buffer));

                    filesDone++;
                    this.filesDone++;
                    progress('sounds', this.filesDone / this.totalFiles);

                    if (filesDone == this.queue.sounds.length) done();
                });
            });
            req.open('GET', url);
            req.send();
        });
    }

    getTexture(name): Texture {
        return this.assets.textures.get(name);
    }

    getMesh(name): Mesh | SkinnedMesh {
        return this.assets.meshes.get(name);
    }

    getMusic(name): HTMLAudioElement {
        return this.assets.music.get(name);
    }

    getSound(name): Sound {
        return this.assets.sounds.get(name);
    }
}