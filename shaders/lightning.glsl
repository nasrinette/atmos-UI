#ifdef GL_ES
precision highp float;
#endif
varying vec2 vUv;
uniform float u_time;
uniform float u_trigger;
uniform float u_seed;

float hash(float n) { return fract(sin(n) * 43758.5453123); }
float noise(in vec2 x) {
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float n = p.x + p.y * 57.0;
    return mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
               mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y);
}
float fbm(vec2 p) {
    float f = 0.0;
    f += 0.50000 * noise(p); p = p * 2.02;
    f += 0.25000 * noise(p); p = p * 2.03;
    f += 0.12500 * noise(p); p = p * 2.01;
    f += 0.06250 * noise(p); p = p * 2.04;
    return f;
}
void main() {
    vec2 uv = vUv;
    if (u_trigger <= 0.0) { discard; }
    float time = u_time;
    float centerX = 0.2 + (u_seed * 0.6);
    float shift = fbm(vec2(uv.y * 5.0, time * 10.0)) * 0.2;
    float dist = abs(uv.x - centerX + shift);
    float bolt = 0.002 / max(dist, 0.001);
    bolt *= smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);
    bolt *= u_trigger;
    vec3 boltColor = vec3(0.8, 0.9, 1.0);
    gl_FragColor = vec4(boltColor, bolt);
}
