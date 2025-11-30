#ifdef GL_ES
precision highp float;
#endif
varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_intensity;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -  i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ; m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}
float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 5; ++i) {
        v += a * snoise(x);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}
void main() {
    vec2 uv = vUv;
    vec2 centered = (vUv - 0.5) * 2.0;
    float pattern = fbm(uv * 3.0 + vec2(u_time * 0.02));
    float crystal = fbm(uv * 12.0);
    float frost = pattern * 0.6 + crystal * 0.4;
    float dist = length(centered);
    float edgeMask = smoothstep(1.0 - (0.6 * u_intensity), 1.0 + (0.3 * u_intensity), dist + (frost * 0.2));
    vec3 iceColor = vec3(0.75, 0.85, 1.0);
    vec3 finalColor = mix(iceColor, vec3(1.0), edgeMask * 0.3);
    float alpha = edgeMask * 0.55;
    alpha += (crystal * 0.05 * alpha);
    gl_FragColor = vec4(finalColor, alpha);
}
