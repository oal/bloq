uniform sampler2D texture;
varying vec3 pos;
varying float mat;
varying vec3 col;

vec2 tex_pos(int mat, vec2 pos) {
    mat--;
    float offset_x = mod(float(mat), 8.0) / 8.0;
    float offset_y = float(int(((float(mat)-offset_x)/8.0))) / 8.0; // int?
    vec2 pos2 = mod(pos/8.0, 1.0/8.0) + vec2(offset_x, offset_y);
    return pos2;
}

void main() {
    // I should try to avoid ifs in shaders for branch prediction, but let's see if it becomes a problem:
    vec2 uv;
    if(abs(fract(pos.x) - 0.5) < 0.0001) uv = fract(pos.yz)-0.5;
    else if(abs(fract(pos.y) - 0.5) < 0.0001) uv = fract(pos.xz)-0.5;
    else uv = fract(pos.xy)-0.5;

    vec4 color = vec4(texture2D(texture, tex_pos(int(mat+0.1), uv)).rgb * col, 1.0);
    gl_FragColor = color;
}