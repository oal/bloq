varying vec3 pos;
attribute float material;
varying float mat;
varying vec3 col;

float rand(vec3 pos){
    return fract(sin(dot(vec2(mod(pos.x, 16.0), mod(pos.z, 16.0)), vec2(17.5623,49.2314))) * 4391.3521)-0.5;
}

void main() {
    mat = material;
    pos = position;
    col = color;
    //float noise = 0; //rand(position)/2.5;
    vec3 noisePos = vec3(position.x, position.y, position.z);
    vec4 mvPosition = modelViewMatrix * vec4(noisePos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
