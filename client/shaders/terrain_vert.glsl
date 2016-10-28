varying vec3 pos;
attribute float material;
attribute float shadow;
varying float mat;
varying float shd;

float rand(vec3 pos){
    return fract(sin(dot(vec2(mod(pos.x, 16.0), mod(pos.z, 16.0)), vec2(17.5623,49.2314))) * 4391.3521)-0.5;
}

void main() {
    mat = material;
    pos = position;
    shd = shadow;
    float noiseX = rand(position)/4.0;
    float noiseZ = rand(-position)/4.0;
    vec3 noisePos = vec3(position.x+noiseX, position.y+noiseX/2.0, position.z+noiseZ);
    vec4 mvPosition = modelViewMatrix * vec4(noisePos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
