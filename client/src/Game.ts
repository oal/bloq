import {Scene, Mesh, WebGLRenderer, PerspectiveCamera, ShaderMaterial} from 'three';

import {buildChunkGeometry} from "./terrain";
import {TERRAIN_CHUNK_SIZE} from "./constants";
import AssetManager from "./AssetManager";

let size = TERRAIN_CHUNK_SIZE;
let data = new Uint8Array(size * size * size).map((_, idx) => Math.sin(idx / 20) + Math.cos(idx / 40) > 0 ? (Math.random() * 3 + 1) | 0 : 0);


export default class Game {
    scene: Scene;
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;
    mesh: Mesh;

    assets: AssetManager = new AssetManager();

    constructor() {
        this.assets.add('texture', 'terrain', 'assets/textures.png');
        this.assets.load(progress => {
            console.log(progress);
            if(progress === 1) {
                this.init();
                this.animate();
            }
        });
    }

    init() {
        this.scene = new Scene();

        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.z = 20;

        console.time('verts');
        let geometry = buildChunkGeometry(data);
        console.timeEnd('verts');

        var material = new ShaderMaterial({
            uniforms: {
                texture: {
                    value: this.assets.findTexture('terrain')
                }
            },
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent

        });

        this.mesh = new Mesh(geometry, material);
        this.scene.add(this.mesh);

        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(this.renderer.domElement);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.mesh.rotation.y += 0.005;
        this.renderer.render(this.scene, this.camera);
    }
}

/*
* new TextureLoader().load('assets/textures.png', tex => {
 tex.minFilter = NearestFilter;
 tex.magFilter = NearestFilter;
 })*/