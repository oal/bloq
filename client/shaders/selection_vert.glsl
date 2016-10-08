uniform vec3 globalPosition;
varying vec3 pos;

float rand(vec3 pos){
    return fract(sin(dot(vec2(mod(pos.x, 16.0), mod(pos.z, 16.0)), vec2(17.5623,49.2314))) * 4391.3521)-0.5;
}

void main() {
    pos = position;
    vec3 globalVertPos = globalPosition + position;
    float noiseX = rand(globalVertPos)/4.0;
    float noiseZ = rand(-globalVertPos)/4.0;
    vec3 noisePos = vec3(position.x*1.01+noiseX, position.y*1.01+noiseX/2.0, position.z*1.01+noiseZ);
    vec4 mvPosition = modelViewMatrix * vec4(noisePos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
