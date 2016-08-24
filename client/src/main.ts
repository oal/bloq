import * as THREE from 'three';

var scene, camera, renderer;

let size = 16;
let data = new Uint8Array(size * size * size).map((_, idx) => Math.sin(idx/10) + Math.cos(idx/20) > 0 ? 1 : 0);

let getPoint = (x, y, z) => {
    if (x < 0 || y < 0 || z < 0 || x >= size || y >= size || z >= size) return 0;
    return data[z * size * size + y * size + x];
};

let buildChunk2 = () => {
    let i = 0;
    let verts = new Float32Array(size*size*size*32);
    for (let z = 0; z < size; z++) {
        let oz = z - size / 2;
        for (let y = 0; y < size; y++) {
            let oy = y - size / 2;
            for (let x = 0; x < size; x++) {
                let val = getPoint(x, y, z);
                if (val) {
                    let ox = x - size / 2;
                    if (!getPoint(x, y, z + 1)) {
                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;


                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz + 0.5;
                    }
                    if (!getPoint(x, y, z - 1)) {
                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;


                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz - 0.5;
                    }
                    if (!getPoint(x, y + 1, z)) {
                        verts[i++] = ox - 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz - 0.5;


                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;
                    }
                    if (!getPoint(x, y - 1, z)) {
                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz + 0.5;


                        verts[i++] = ox + 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;
                    }
                    if (!getPoint(x + 1, y, z)) {

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;


                        verts[i++] = ox + 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox + 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;
                    }

                    if (!getPoint(x - 1, y, z)) {
                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz - 0.5;


                        verts[i++] = ox - 0.5;
                        verts[i++] = oy + 0.5;
                        verts[i++] = oz + 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz - 0.5;

                        verts[i++] = ox - 0.5;
                        verts[i++] = oy - 0.5;
                        verts[i++] = oz + 0.5;

                    }
                }
            }
        }
    }

    return verts.slice(0, i);
};

console.time('verts');
let verts = buildChunk2();
console.timeEnd('verts');
console.time('verts');
let verts = buildChunk2();
console.timeEnd('verts');
console.time('verts');
let verts = buildChunk2();
console.timeEnd('verts');
console.time('verts');
let verts = buildChunk2();
console.timeEnd('verts');
console.time('verts');
let verts = buildChunk2();
console.timeEnd('verts');
console.time('verts');
let verts = buildChunk2();
console.timeEnd('verts');

console.log(verts.length);

var geometry = new THREE.BufferGeometry();
// create a simple square shape. We duplicate the top left and bottom right
// vertices because each vertex needs to appear once per triangle.
var vertices = Float32Array.from(verts);
/*new Float32Array([
 -1.0, -1.0, 1.0,
 1.0, -1.0, 1.0,
 1.0, 1.0, 1.0,

 1.0, 1.0, 1.0,
 -1.0, 1.0, 1.0,
 -1.0, -1.0, 1.0
 ]);*/

// itemSize = 3 because there are 3 values (components) per vertex
geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometry.computeVertexNormals();

var material = new THREE.ShaderMaterial({

    uniforms: {
        time: {value: 1.0},
        resolution: {value: new THREE.Vector2()}
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent

});

var mesh = new THREE.Mesh(geometry, material);


init();
animate();

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 30;

    //geometry = new THREE.BoxGeometry( 200, 200, 200 );
    //material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

}

function animate() {

    requestAnimationFrame(animate);

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;

    renderer.render(scene, camera);

}