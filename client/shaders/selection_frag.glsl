varying vec3 pos;

void main() {
    vec3 absPos = abs(pos);
    if(
        (fract(absPos.x) < 0.48 && fract(absPos.y) < 0.48) ||
        (fract(absPos.x) < 0.48 && fract(absPos.z) < 0.48) ||
        (fract(absPos.y) < 0.48 && fract(absPos.z) < 0.48)
    ) discard;
    gl_FragColor = vec4(1.0, 1.0, 1.0, 0.0);
}
