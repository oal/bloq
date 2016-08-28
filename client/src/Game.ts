import AssetManager from "./AssetManager";
import Server from "./Server";
import World from "./World";


export default class Game {
    assetManager: AssetManager;

    world: World;
    server: Server;

    constructor() {
        this.loadAssets(() => {
            this.world = new World(this);
            this.server = new Server(this);
            this.tick();
        });
    }

    loadAssets(callback) {
        let assets = new AssetManager();
        assets.add('texture', 'terrain', './assets/textures.png');
        assets.load(progress => {
            // TODO: Show loading progress in GUI.
            console.log(progress);

            // Continue setup when everything is loaded.
            if (progress === 1) callback();
        });

        this.assetManager = assets;
    }

    tick() {
        this.world.tick(1/60);
        requestAnimationFrame(this.tick.bind(this));
    }

}