export const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.45);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += noise(p) * a;
    p = mat2(1.62, 1.18, -1.18, 1.62) * p;
    a *= 0.48;
  }
  return v;
}

vec2 domainWarp(vec2 p, float drift) {
  vec2 slow = vec2(
    fbm(p * 0.58 + vec2(drift * 0.045, 3.1)),
    fbm(p * 0.62 + vec2(-2.7, drift * 0.04))
  ) - 0.5;
  vec2 fine = vec2(
    fbm(p * 1.5 + slow * 1.4 + vec2(7.2, -drift * 0.055)),
    fbm(p * 1.35 + slow * 1.2 + vec2(drift * 0.06, 5.4))
  ) - 0.5;
  return p + slow * 1.1 + fine * 0.44;
}

float atmosphericHaze(vec2 q, float horizon) {
  float horizonFog = exp(-abs(q.y - horizon) * 18.0);
  float skyMist = smoothstep(horizon - 0.04, horizon + 0.32, q.y) * (1.0 - smoothstep(0.9, 1.05, q.y));
  float waterMist = (1.0 - smoothstep(horizon - 0.18, horizon + 0.04, q.y)) * smoothstep(0.08, horizon + 0.04, q.y);
  return clamp(horizonFog * 0.28 + skyMist * 0.06 + waterMist * 0.05, 0.0, 1.0);
}

vec2 sunPosition() {
  return vec2(0.67, 0.72);
}

float sunDisc(vec2 q, float aspect) {
  vec2 p = q - sunPosition();
  p.x *= aspect;
  return smoothstep(0.085, 0.0, length(p));
}

float sunRays(vec2 q, float aspect, float cloudMask) {
  vec2 p = q - sunPosition();
  p.x *= aspect;
  float d = length(p);
  float angle = atan(p.y, p.x);
  float spokes = 0.62 + 0.38 * sin(angle * 9.0 + fbm(p * 3.2 + uTime * 0.015) * 3.1);
  float radial = exp(-d * 2.8) * smoothstep(0.05, 0.64, d);
  float downward = smoothstep(0.72, 0.12, q.y);
  float drop = max(sunPosition().y - q.y, 0.0);
  float shaftA = exp(-pow((p.x + drop * 0.2) * 4.2, 2.0));
  float shaftB = exp(-pow((p.x - drop * 0.34) * 5.4, 2.0));
  float shaftC = exp(-pow((p.x + drop * 0.55) * 6.2, 2.0));
  float rayBreakup = 0.62 + fbm(p * vec2(5.2, 2.6) + vec2(uTime * 0.012, 4.2)) * 0.38;
  float shafts = (shaftA * 0.46 + shaftB * 0.36 + shaftC * 0.24) * smoothstep(0.02, 0.54, drop) * (1.0 - smoothstep(0.66, 0.9, drop));
  return (radial * spokes * 0.84 + shafts * rayBreakup * 1.45) * downward * (1.0 - cloudMask * 0.22);
}

float cloudPuff(vec2 q, vec2 center, vec2 scale, float seed) {
  vec2 p = (q - center) * scale;
  float core = exp(-dot(p, p));
  float ragged = fbm(p * 2.1 + vec2(seed, seed * 1.7));
  float shadow = exp(-dot(p + vec2(0.12, -0.16), p + vec2(0.12, -0.16)) * 0.74);
  return smoothstep(0.22, 0.66, core * (0.8 + ragged * 0.52) + shadow * 0.18);
}

float cloudVolume(vec2 q, float aspect, float horizon, float drift) {
  vec2 uv = vec2((q.x - 0.5) * aspect + 0.5, q.y);
  vec2 warped = domainWarp(uv * vec2(2.1, 1.35) + vec2(drift * 0.012, -drift * 0.007), drift);
  float base = fbm(warped * vec2(1.25, 1.65) + vec2(0.0, 2.4));
  float body = fbm(warped * vec2(2.15, 2.45) + vec2(5.4, -1.6));
  float edge = fbm(warped * vec2(4.5, 4.2) + vec2(-3.3, 7.1));
  float mass = smoothstep(0.42, 0.66, base * 0.74 + body * 0.34 + edge * 0.14);
  float cloudShelf = smoothstep(horizon + 0.12, horizon + 0.34, q.y) * (1.0 - smoothstep(0.9, 1.04, q.y));
  float cumulus = cloudPuff(q, vec2(0.22, 0.78), vec2(4.1, 11.0), 2.1);
  cumulus += cloudPuff(q, vec2(0.38, 0.74), vec2(3.2, 9.0), 5.7) * 0.82;
  cumulus += cloudPuff(q, vec2(0.77, 0.78), vec2(3.5, 10.0), 8.4) * 0.74;
  cumulus += cloudPuff(q, vec2(0.92, 0.7), vec2(5.2, 14.0), 11.9) * 0.62;
  float cumulusBand = smoothstep(horizon + 0.16, horizon + 0.46, q.y) * (1.0 - smoothstep(0.96, 1.05, q.y));
  float sunBreak = 1.0 - sunDisc(q, aspect) * 0.72;
  return clamp(max(mass * cloudShelf, cumulus * cumulusBand) * sunBreak, 0.0, 1.0);
}

float waveLayer(vec2 p, vec2 direction, float frequency, float speed, float weight) {
  return sin(dot(p, normalize(direction)) * frequency + uTime * speed) * weight;
}

float oceanSwells(vec2 p, float depth) {
  vec2 warped = domainWarp(p * vec2(0.48, 0.34) + vec2(uTime * 0.018, -uTime * 0.014), uTime);
  float broad = waveLayer(warped, vec2(1.0, 0.24), 2.8, -0.22, 0.38);
  broad += waveLayer(warped + vec2(4.3, 1.2), vec2(-0.64, 1.0), 3.6, 0.17, 0.3);
  float mid = waveLayer(warped * vec2(1.34, 1.0) + vec2(1.8, -2.0), vec2(0.8, 1.0), 7.2, -0.4, 0.16);
  mid += waveLayer(warped * vec2(1.2, 1.25) + vec2(-2.6, 3.9), vec2(-1.0, 0.58), 9.0, 0.34, 0.14);
  float chop = fbm(warped * 3.35 + vec2(0.0, uTime * 0.045)) - 0.5;
  float distanceFade = smoothstep(0.02, 0.82, depth);
  return (broad + mid * distanceFade + chop * 0.16 * distanceFade) * (0.5 + depth * 0.62);
}

vec3 seaNormal(vec2 p, float depth) {
  float e = mix(0.042, 0.014, smoothstep(0.0, 1.0, depth));
  float h = oceanSwells(p, depth);
  float hx = oceanSwells(p + vec2(e, 0.0), depth) - h;
  float hy = oceanSwells(p + vec2(0.0, e), depth) - h;
  return normalize(vec3(-hx * 1.55, 0.58, -hy * 2.05));
}

float foamCrests(vec2 seaUv, float depth, float height, float slope, float easedDepth) {
  vec2 crestUv = domainWarp(seaUv * vec2(0.8, 0.5) + vec2(uTime * 0.012, -uTime * 0.022), uTime);
  float perspectiveFrequency = mix(13.0, 4.6, easedDepth);
  float crestA = pow(max(0.0, 0.5 + 0.5 * sin(dot(crestUv, normalize(vec2(1.0, 0.22))) * perspectiveFrequency - uTime * 0.36)), 8.0);
  float crestB = pow(max(0.0, 0.5 + 0.5 * sin(dot(crestUv, normalize(vec2(-0.72, 1.0))) * (perspectiveFrequency * 0.82) + uTime * 0.28)), 7.0);
  float breakup = 0.36 + fbm(crestUv * 1.72 + vec2(4.0, -1.7)) * 0.72;
  float heightCrest = smoothstep(0.08, 0.66, height + slope * 0.82);
  float woven = max(crestA * 0.76, crestB * 0.58) * breakup;
  woven = max(woven, heightCrest * 0.58);
  woven *= smoothstep(0.04, 0.9, depth) * (1.0 - smoothstep(0.97, 1.08, depth));
  return woven;
}

vec3 skyColor(vec2 q, float cloudMask, float horizon, float aspect) {
  vec3 horizonTint = vec3(0.84, 0.96, 1.0);
  vec3 upper = vec3(0.62, 0.82, 0.97);
  vec3 zenith = vec3(0.43, 0.68, 0.93);
  float skyRise = smoothstep(horizon + 0.05, 1.0, q.y);
  vec3 sky = mix(horizonTint, upper, skyRise);
  sky = mix(sky, zenith, smoothstep(0.72, 1.05, q.y) * 0.42);

  float disc = sunDisc(q, aspect);
  float rays = sunRays(q, aspect, cloudMask);
  sky += vec3(1.0, 0.82, 0.46) * rays * 0.9;
  sky = mix(sky, vec3(1.0, 0.95, 0.72), disc * 0.92);
  sky += vec3(1.0, 0.88, 0.5) * exp(-length((q - sunPosition()) * vec2(aspect, 1.0)) * 7.0) * 0.3;

  vec3 cloudLight = vec3(0.98, 1.0, 0.98);
  vec3 cloudShade = vec3(0.45, 0.64, 0.82);
  float cloudEdge = smoothstep(0.04, 0.7, cloudMask);
  vec3 clouds = mix(cloudShade, cloudLight, smoothstep(0.18, 0.86, q.y) * 0.68 + disc * 0.2);
  sky = mix(sky, clouds, cloudEdge * 0.86);

  return sky;
}

vec3 waterColor(vec2 q, float aspect, float horizon, float haze) {
  float depth = clamp((horizon - q.y) / horizon, 0.0, 1.0);
  float easedDepth = smoothstep(0.0, 1.0, depth);
  float projectedY = depth * depth * 8.4 + depth * 1.55;
  vec2 seaUv = vec2((q.x - 0.5) * aspect * mix(7.2, 2.35, easedDepth), projectedY);

  vec3 n = seaNormal(seaUv, depth);
  vec3 lightDir = normalize(vec3(-0.42, 0.82, 0.38));
  vec3 viewDir = normalize(vec3(0.0, 0.42, 0.9));
  float facing = clamp(dot(n, lightDir), 0.0, 1.0);
  float spec = pow(max(dot(reflect(-lightDir, n), viewDir), 0.0), mix(28.0, 78.0, depth));
  float fresnel = pow(1.0 - clamp(dot(n, viewDir), 0.0, 1.0), 2.0);
  float height = oceanSwells(seaUv, depth);
  float slope = clamp(length(n.xz), 0.0, 1.0);

  vec3 shallow = vec3(0.42, 0.78, 0.88);
  vec3 deep = vec3(0.03, 0.25, 0.44);
  vec3 water = mix(shallow, deep, smoothstep(0.04, 1.0, easedDepth));

  float reflectedClouds = fbm(domainWarp(seaUv * vec2(0.18, 0.12) + vec2(0.0, uTime * 0.01), uTime));
  water = mix(water, vec3(0.72, 0.91, 0.98), reflectedClouds * (0.18 + fresnel * 0.22) * (1.0 - easedDepth * 0.55));
  water += vec3(0.08, 0.2, 0.3) * facing * 0.32;

  float foam = foamCrests(seaUv, depth, height, slope, easedDepth);
  float trough = smoothstep(0.18, 0.9, slope) * (1.0 - foam * 0.5) * smoothstep(0.08, 0.95, depth);
  water -= vec3(0.03, 0.08, 0.12) * trough * 1.15;
  water += vec3(0.7, 0.96, 1.0) * foam * (0.3 + 0.2 * depth);
  water += vec3(0.82, 0.94, 1.0) * spec * (0.44 + depth * 0.58);

  float sunColumn = exp(-abs(q.x - sunPosition().x) * 11.0) * smoothstep(0.02, 0.52, depth) * (1.0 - smoothstep(0.82, 1.02, depth));
  float sparkle = pow(max(0.0, sin(seaUv.y * 9.5 + seaUv.x * 2.4 - uTime * 0.5)), 8.0) * foam;
  water += vec3(1.0, 0.86, 0.52) * sunColumn * (0.11 + sparkle * 0.3);

  float brandGlint = exp(-abs(q.x - 0.58) * 8.0) * smoothstep(0.02, 0.34, depth) * (1.0 - smoothstep(0.62, 1.0, depth));
  water += vec3(0.08, 0.18, 0.42) * brandGlint * spec * 0.36;
  water = mix(water, vec3(0.78, 0.94, 1.0), haze * 0.08);
  return water;
}

void main() {
  vec2 q = gl_FragCoord.xy / uRes.xy;
  float aspect = uRes.x / uRes.y;
  float horizon = 0.45;
  float haze = atmosphericHaze(q, horizon);

  float clouds = cloudVolume(q, aspect, horizon, uTime);
  vec3 sky = skyColor(q, clouds, horizon, aspect);
  vec3 water = waterColor(q, aspect, horizon, haze);

  float waterMask = 1.0 - smoothstep(horizon - 0.075, horizon + 0.055, q.y);
  vec3 horizonLight = vec3(0.82, 0.96, 1.0) * haze * 0.24;
  vec3 col = mix(sky, water, waterMask);
  col = mix(col, vec3(0.84, 0.96, 1.0), haze * 0.08) + horizonLight;

  float vignette = smoothstep(0.55, 1.05, length((q - vec2(0.5, 0.52)) * vec2(0.86, 0.68)));
  col = mix(col, col * vec3(0.87, 0.94, 1.02), vignette * 0.14);
  col += vec3(0.08, 0.02, 0.15) * smoothstep(0.56, 1.0, q.x) * smoothstep(0.16, 0.92, q.y) * 0.026;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
