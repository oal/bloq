import {Scene, Mesh, WebGLRenderer, PerspectiveCamera, ShaderMaterial} from 'three';

import BaseWorld from "../../shared/BaseWorld";
import {updateKeyboard, syncPlayer, updateMeshes} from "./systems";
import {TERRAIN_CHUNK_SIZE} from "./constants";
import {buildChunkGeometry} from "./terrain";
import Game from "./Game";
import {PositionComponent} from "../../shared/components";
import {registerClientComponents} from "./components";

let size = TERRAIN_CHUNK_SIZE;
let data = new Uint8Array(size * size * size).map((_, idx) => Math.sin(idx / 20) + Math.cos(idx / 40) > 0 ? (Math.random() * 3 + 1) | 0 : 0);

export default class World extends BaseWorld {
    scene: Scene;
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;
    mesh: Mesh;

    game: Game;

    constructor(game: Game) {
        super();
        this.game = game;

        registerClientComponents(this.entityManager);

        this.scene = new Scene();

        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.z = 20;

        /*console.time('verts');
        let geometry = buildChunkGeometry(data);
        console.timeEnd('verts');

        var material = new ShaderMaterial({
            uniforms: {
                texture: {
                    value: this.game.assetManager.findTexture('terrain')
                }
            },
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent
        });

        this.mesh = new Mesh(geometry, material);
        this.scene.add(this.mesh);*/

        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(this.renderer.domElement);
    }

    tick(dt) {
        updateKeyboard(this.entityManager);
        super.tick(dt);

        /*this.entityManager.getEntities('position').forEach((component, type) => {
            let pos = (component as PositionComponent);
            this.mesh.position.x = pos.x;
            this.mesh.position.z = pos.z;
        });*/

        syncPlayer(this.entityManager, this.game.server);
        updateMeshes(this.entityManager, this.scene);
        this.renderer.render(this.scene, this.camera);
    }
}