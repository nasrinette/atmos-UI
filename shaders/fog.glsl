#ifdef GL_ES
precision highp float;
#endif
varying vec2 vUv;
uniform float u_time;
uniform float u_intensity;

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
    return f;
}
void main() {
    vec2 uv = vUv;
    float time = u_time * 0.2;
    float q = fbm(uv * 3.0 + vec2(time * 0.5, time * 0.1));
    float r = fbm(uv * 6.0 + vec2(time * 0.8, -time * 0.2) + vec2(q));
    float f = mix(q, r, 0.5);
    float density = smoothstep(0.0, 1.5 - (0.4 * u_intensity), f);
    vec3 fogColor = vec3(0.85, 0.88, 0.92);
    float alpha = density * 0.7 * clamp(u_intensity, 0.0, 1.0);
    gl_FragColor = vec4(fogColor, alpha);
}
