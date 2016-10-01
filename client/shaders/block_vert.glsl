varying vec3 pos;
attribute float material;
varying float mat;

void main() {
    mat = material;
    pos = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
