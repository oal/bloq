import {Scene, WebGLRenderer, PerspectiveCamera, ShaderMaterial, Vector3} from 'three';

import BaseWorld from "../../shared/BaseWorld";
import {
    updatePlayerInputs, syncPlayer, updateMeshes, updateTerrainChunks, updateTerrainCollision,
    updatePlayerMeshes
} from "./systems";
import Game from "./Game";
import {registerClientComponents} from "./components";
import {removeEntities} from "./systems";
import {updatePhysics, updateMovement, updatePositions} from "../../shared/systems";


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
        this.camera.name = 'camera'; // Used to look up camera from e.g. player's Object3D.

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

        // TODO: Add a more robust version of this to capture lock if player presses escape and tries to re-lock.
        this.renderer.domElement.onclick = () => {
            this.renderer.domElement.requestPointerLock();
            this.renderer.domElement.onclick = null;
        }
    }

    tick(dt) {
        removeEntities(this.entityManager);
        updateTerrainChunks(this.entityManager, this.scene, this.terrainMaterial);
        updatePlayerInputs(this.entityManager, dt);

        updatePhysics(this.entityManager, dt);
        updateTerrainCollision(this.entityManager);
        updateMovement(this.entityManager, dt);
        updatePositions(this.entityManager, dt);

        syncPlayer(this.entityManager, this.game.server);
        updateMeshes(this.entityManager, this.scene);
        updatePlayerMeshes(this.entityManager, this.scene);

        this.renderer.render(this.scene, this.camera);
    }
}