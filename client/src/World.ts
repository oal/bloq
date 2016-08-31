import {Scene, WebGLRenderer, PerspectiveCamera, ShaderMaterial} from 'three';

import BaseWorld from "../../shared/BaseWorld";
import {updatePlayerInputs, syncPlayer, updateMeshes, updateTerrainChunks} from "./systems";
import Game from "./Game";
import {registerClientComponents} from "./components";
import {removeEntities} from "./systems";


export default class World extends BaseWorld {
    scene: Scene;
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;
    terrainMaterial: ShaderMaterial;

    game: Game;

    constructor(game: Game) {
        super();
        this.game = game;

        registerClientComponents(this.entityManager);

        this.scene = new Scene();

        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.z = 20;

        this.terrainMaterial = new ShaderMaterial({
            uniforms: {
                texture: {
                    value: this.game.assetManager.findTexture('terrain')
                }
            },
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent
        });

        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(this.renderer.domElement);
    }

    tick(dt) {
        removeEntities(this.entityManager);
        updateTerrainChunks(this.entityManager, this.scene, this.terrainMaterial);
        updatePlayerInputs(this.entityManager, dt);

        // Handle BaseWorld systems.
        super.tick(dt);

        syncPlayer(this.entityManager, this.game.server);
        updateMeshes(this.entityManager, this.scene);

        this.renderer.render(this.scene, this.camera);
    }
}