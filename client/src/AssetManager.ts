import {TextureLoader, NearestFilter} from 'three';

export default class AssetManager {
    isLoaded: boolean;
    textureLoader = new TextureLoader();

    queue: Array<[string, string, string]> = [];
    assets = {
        textures: {}
    };

    constructor() {

    }

    add(type, name, url) {
        this.queue.push([type, name, url]);
    }

    load(callback) {
        if(this.isLoaded) return;

        let totalFiles = this.queue.length;
        let filesDone = 0;
        this.queue.forEach(pair => {
            let [type, name, url] = pair;
            if(type === 'texture') {
                this.textureLoader.load(url, texture => {
                    texture.minFilter = NearestFilter;
                    texture.magFilter = NearestFilter;
                    this.assets.textures[name] = texture;
                    filesDone++;
                    callback(filesDone/totalFiles);
                });
            }
        });

        this.queue = [];
    }


    findTexture(name) {
        return this.assets.textures[name];
    }
}