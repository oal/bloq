import {
    Scene,
    WebGLRenderer,
    PerspectiveCamera,
    ShaderMaterial,
    VertexColors,
} from 'three';
import * as Keymaster from 'keymaster';

import BaseWorld from "../../shared/BaseWorld";
import Game from "./Game";
import {registerClientComponents} from "./components";
import {ClientActionManager} from "./actions";

import ActionExecutionSystem from "../../shared/systems/ActionExecutionSystem";
import TerrainChunkSystem from "./systems/TerrainChunkSystem";
import PlayerInputSystem from "./systems/PlayerInputSystem";
import PlayerInputSyncSystem from "./systems/PlayerInputSyncSystem";
import MeshSystem from "./systems/MeshSystem";
import PlayerMeshSystem from "./systems/PlayerMeshSystem";
import PlayerSelectionSystem from "./systems/PlayerSelectionSystem";
import DebugTextSystem from "./systems/DebugTextSystem";
import MouseManager from "../lib/MouseManager";


export default class World extends BaseWorld {
    scene: Scene;
    camera: PerspectiveCamera;
    terrainMaterial: ShaderMaterial;

    game: Game;

    constructor(game: Game) {
        super();
        this.actionManager = new ClientActionManager();
        this.game = game;

        registerClientComponents(this.entityManager);

        this.scene = new Scene();

        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
        this.camera.name = 'camera'; // Used to look up camera from e.g. player's Object3D.

        this.terrainMaterial = new ShaderMaterial({
            uniforms: {
                texture: {
                    value: this.game.assetManager.getTexture('terrain')
                }
            },
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent,
            vertexColors: VertexColors
        });

        this.addSystems();
    }

    addSystems() {
        // TODO: Store system orders as constants in one place.
        this.addSystem(new ActionExecutionSystem(this.entityManager, this.actionManager), -1000); // Always process first
        this.addSystem(new TerrainChunkSystem(this.entityManager, this.scene, this.terrainMaterial), -9);

        let mouseManager = new MouseManager(this.game.renderer.domElement);
        this.addSystem(new PlayerInputSystem(this.entityManager, mouseManager), -8);

        this.addSystem(new PlayerInputSyncSystem(this.entityManager, this.game.server), 10);
        this.addSystem(new MeshSystem(this.entityManager, this.scene), 11);
        this.addSystem(new PlayerMeshSystem(this.entityManager, this.scene), 12);
        this.addSystem(new PlayerSelectionSystem(this.entityManager, this.scene), 13);

        this.addSystem(new DebugTextSystem(this.entityManager), 1000);
    }

    tick(dt) {
        super.tick(dt);
    }
}