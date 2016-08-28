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
            this.startGameLoop();
        });
    }


    loadAssets(callback: Function) {
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

    startGameLoop() {
        // Use closure to avoid adding time related stuff to the game object.
        let currentTime = performance.now();
        let update = () => {
            let newTime = performance.now();
            let dt = (newTime - currentTime) / 1000;

            this.tick(dt);

            currentTime = newTime;
            requestAnimationFrame(update);
        };
        update();
    }

    tick(dt: number) {
        this.world.tick(dt);
    }

}