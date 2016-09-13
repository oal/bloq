import {TextureLoader, JSONLoader, NearestFilter, Texture, MeshBasicMaterial, SkinnedMesh, Mesh} from 'three';
import AnimatedMesh from "./AnimatedMesh";


export default class AssetManager {
    isLoaded: boolean;
    textureLoader: TextureLoader = new TextureLoader();
    meshLoader: JSONLoader = new JSONLoader();

    queue: {
        textures: Array<[string, string]>,
        meshes: Array<[string, string]>
    };

    assets: {
        textures: Map<string, Texture>,
        meshes: Map<string, Mesh | AnimatedMesh>
    };

    constructor() {
        this.queue = {
            textures: [],
            meshes: []
        };
        this.assets = {
            textures: new Map<string, Texture>(),
            meshes: new Map<string, Mesh | SkinnedMesh>()
        };
    }
    addTexture(name: string, url: string) {
        this.queue.textures.push([name, url]);
    }

    addMesh(name: string, url: string) {
        this.queue.meshes.push([name, url]);
    }

    load(callback: Function) {
        if (this.isLoaded) return;

        this.loadTextures(callback, () => {
            console.log('Textures loaded');
            this.queue.textures = [];
            this.loadMeshes(callback, () => {
                console.log('Meshes loaded.');
                this.queue.meshes = [];
                this.isLoaded = true;
            });
        });
    }

    loadTextures(progress: Function, done: Function) {
        let totalFiles = this.queue.textures.length + this.queue.meshes.length;
        let filesDone = 0;

        this.queue.textures.forEach(pair => {
            let [name, url] = pair;
            this.textureLoader.load(url, texture => {
                texture.minFilter = NearestFilter;
                texture.magFilter = NearestFilter;
                this.assets.textures.set(name, texture);
                filesDone++;
                progress(filesDone / totalFiles);
                if (filesDone == this.queue.textures.length) done();
            });
        });
    }

    loadMeshes(progress: Function, done: Function) {
        let totalFiles = this.queue.textures.length + this.queue.meshes.length;
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
                progress(filesDone / totalFiles);
                if (filesDone == this.queue.meshes.length) done();
            });
        });
    }

    getTexture(name): Texture {
        return this.assets.textures.get(name);
    }

    getMesh(name): Mesh | SkinnedMesh {
        return this.assets.meshes.get(name);
    }
}