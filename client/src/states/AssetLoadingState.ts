import {State} from "./State";
import AssetManager from "../../lib/AssetManager";
import MenuState from "./MenuState";
import HTMLParser from "../../lib/HTMLParser";

const html = `
    <div id="loader">
        <style></style>
        <progress value="0" max="1"></progress>
    </div>
`;

export default class AssetLoadingState extends State {
    private progressDescription: string;
    private progress: number = 0;

    private loaderNode: Element;
    private styleNode: HTMLStyleElement;
    private progressNode: HTMLProgressElement;

    constructor() {
        super();
        let parser = new HTMLParser();
        this.loaderNode = parser.parse(html);
    }

    onEnter() {
        this.loadAssets();

        document.body.appendChild(this.loaderNode);
        this.styleNode = this.loaderNode.querySelector('style') as HTMLStyleElement;
        this.progressNode = this.loaderNode.querySelector('progress') as HTMLProgressElement;
    }

    onExit() {
        document.body.removeChild(this.loaderNode);
    }

    tick(dt: number) {
        // Update progress bar.
        if (this.progress != this.progressNode.value) {
            this.progressNode.value = this.progress;

            let percent = (this.progress * 100.0) | 0;
            this.styleNode.innerHTML = `
            #loader progress:before {
                content: 'Loading ${this.progressDescription} (${percent}%)'
            }`;
        }
    }

    private loadAssets() {
        // Textures
        this.assetManager.addTexture('terrain', require('../../assets/textures.png'));
        this.assetManager.addTexture('player', require('../../assets/player.png'));

        // Meshes
        this.assetManager.addMesh('player', require('../../assets/player.json'));

        // Music
        this.assetManager.addMusic('music', require('file!../../assets/sound/music.ogg'));

        // Sound effects
        this.assetManager.addSound('walk', require('file!../../assets/sound/walk.ogg'));
        this.assetManager.addSound('dig', require('file!../../assets/sound/dig.ogg'));
        this.assetManager.addSound('pickup', require('file!../../assets/sound/pickup.ogg'));

        this.assetManager.load((description, progress) => {
            this.progressDescription = description;
            this.progress = progress;

            if (this.progress >= 1.0) {
                this.transitionTo(new MenuState());
            }
        });
    }
}