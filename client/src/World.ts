import {Scene, WebGLRenderer, PerspectiveCamera, ShaderMaterial, SkeletonHelper, AnimationMixer, JSONLoader, SkinnedMesh, MeshBasicMaterial} from 'three';

import BaseWorld from "../../shared/BaseWorld";
import {
    RemoveEntitySystem, TerrainChunkSystem, PlayerInputSystem, PlayerInputSyncSystem, MeshSystem, PlayerMeshSystem,
    PlayerSelectionSystem
} from "./systems";
import Game from "./Game";
import {registerClientComponents} from "./components";
import {ClientActionManager} from "./actions";
import {ActionExecutionSystem} from "../../shared/systems";


export default class World extends BaseWorld {
    scene: Scene;
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;
    terrainMaterial: ShaderMaterial;
    mixer: any;

    game: Game;

    constructor(game: Game) {
        super();
        this.actionManager = new ClientActionManager();
        this.game = game;

        registerClientComponents(this.entityManager);

        this.scene = new Scene();

        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.25, 10000);
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
        this.renderer.setClearColor(0xBFF0FF);

        document.body.appendChild(this.renderer.domElement);

        // TODO: Add a more robust version of this to capture lock if player presses escape and tries to re-lock.
        this.renderer.domElement.onclick = () => {
            this.renderer.domElement.requestPointerLock();
            this.renderer.domElement.onclick = null;
        };

        this.addSystems();

        var loader = new JSONLoader();
        loader.load('./assets/player.json', ( geometry, materials ) => {
            let m = new MeshBasicMaterial({
                map: this.game.assetManager.findTexture('player'),
                skinning: true,
                morphTargets: true
            });

            let mesh = new SkinnedMesh( geometry, m );
            mesh.name = "Test";
            mesh.position.set( 0, 10, 0 );
            this.scene.add( mesh );

            this.mixer = new AnimationMixer( mesh );

            let clip = geometry.animations[3];
            let action = this.mixer.clipAction( clip, mesh );
            action.play();
        } );


    }

    addSystems() {
        // TODO: Store system orders as constants in one place.
        this.addSystem(new ActionExecutionSystem(this.entityManager, this.actionManager), -1000); // Always process first
        this.addSystem(new RemoveEntitySystem(this.entityManager), -10);
        this.addSystem(new TerrainChunkSystem(this.entityManager, this.scene, this.terrainMaterial), -9);
        this.addSystem(new PlayerInputSystem(this.entityManager), -8);

        this.addSystem(new PlayerInputSyncSystem(this.entityManager, this.game.server), 10);
        this.addSystem(new MeshSystem(this.entityManager, this.scene), 11);
        this.addSystem(new PlayerMeshSystem(this.entityManager, this.scene), 12);
        this.addSystem(new PlayerSelectionSystem(this.entityManager, this.scene), 13);

        console.log(this.systems);
        console.log(this.systemsOrder)
    }

    tick(dt) {
        super.tick(dt);

        if( this.mixer ) {
            this.mixer.update( dt );
            //helper.update();
        }
        this.renderer.render(this.scene, this.camera);
    }
}