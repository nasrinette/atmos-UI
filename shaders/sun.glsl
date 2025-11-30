#ifdef GL_ES
precision highp float;
#endif
varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_intensity;
void main() {
    vec2 uv = vUv;
    float time = u_time * 0.5;
    vec2 sunPos = vec2(0.9 + sin(time * 0.5) * 0.1, 0.9 + cos(time * 0.3) * 0.1);
    float d = distance(uv, sunPos);
    float glow = smoothstep(1.5, 0.2, d);
    float heat = sin(uv.y * 20.0 - time * 2.0) * 0.02;
    heat += sin(uv.x * 15.0 + time) * 0.02;
    float sheenPos = fract(time * 0.1);
    float sheen = smoothstep(0.0, 0.2, 1.0 - abs(uv.x + uv.y - (sheenPos * 3.0)));
    vec3 gold = vec3(1.0, 0.85, 0.6);
    vec3 white = vec3(1.0, 1.0, 0.9);
    vec3 finalColor = mix(gold, white, sheen * 0.5 + heat * 2.0);
    float alpha = (glow * 0.25 + sheen * 0.15) * u_intensity;
    gl_FragColor = vec4(finalColor, alpha);
}
