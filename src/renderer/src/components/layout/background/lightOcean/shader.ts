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
  for (int i = 0; i < 3; i++) {
    v += noise(p) * a;
    p *= 2.05;
    a *= 0.48;
  }
  return v;
}

vec3 skyColor(vec2 q, float cloudMask) {
  vec3 horizon = vec3(0.88, 0.965, 1.0);
  vec3 upper = vec3(0.70, 0.88, 1.0);
  vec3 zenith = vec3(0.52, 0.75, 0.98);
  float t = smoothstep(0.42, 1.0, q.y);
  vec3 sky = mix(horizon, upper, t);
  sky = mix(sky, zenith, smoothstep(0.76, 1.0, q.y) * 0.4);
  vec3 cloudShade = vec3(0.58, 0.76, 0.94);
  vec3 cloudLight = vec3(0.98, 1.0, 1.0);
  vec3 cloud = mix(cloudShade, cloudLight, smoothstep(0.55, 0.95, cloudMask));
  return mix(sky, cloud, cloudMask * 0.62);
}

void main() {
  vec2 q = gl_FragCoord.xy / uRes.xy;
  float aspect = uRes.x / uRes.y;
  float t = uTime;
  float horizon = 0.47;

  vec2 skyUv = vec2(q.x * aspect * 1.25 + t * 0.006, q.y * 1.4 + t * 0.004);
  float cloudBase = fbm(skyUv * 2.0 + vec2(1.2, 0.0));
  float cloudDetail = fbm(skyUv * 4.4 + vec2(-2.0, 3.0)) * 0.34;
  float cloudBand = smoothstep(horizon + 0.04, horizon + 0.18, q.y) * (1.0 - smoothstep(0.9, 1.02, q.y));
  float cloudMask = smoothstep(0.3, 0.62, cloudBase + cloudDetail) * cloudBand;
  vec2 cloudA = (q - vec2(0.22, 0.72)) * vec2(3.0, 8.0);
  vec2 cloudB = (q - vec2(0.78, 0.68)) * vec2(2.6, 7.0);
  vec2 cloudC = (q - vec2(0.52, 0.82)) * vec2(4.2, 9.5);
  float cloudBlobs = exp(-dot(cloudA, cloudA)) * 0.58 + exp(-dot(cloudB, cloudB)) * 0.5 + exp(-dot(cloudC, cloudC)) * 0.28;
  cloudMask = max(cloudMask, cloudBlobs * cloudBand);

  vec3 sky = skyColor(q, cloudMask);
  float coolGlow = exp(-length((q - vec2(0.64, 0.56)) * vec2(1.4, 4.2)) * 2.6);
  sky += vec3(0.12, 0.24, 0.36) * coolGlow;

  float waterMask = 1.0 - smoothstep(horizon - 0.012, horizon + 0.012, q.y);
  float waterDepth = clamp((horizon - q.y) / horizon, 0.0, 1.0);
  float rippleA = sin((q.y * 88.0 + q.x * 8.0) - t * 0.58);
  float rippleB = sin((q.y * 142.0 - q.x * 18.0) + t * 0.84);
  float rippleC = sin((q.y * 36.0 + q.x * 22.0) - t * 0.28);
  float distortion = (rippleA * 0.006 + rippleB * 0.003 + rippleC * 0.005) * (0.22 + waterDepth * 0.78);
  vec2 reflectQ = vec2(q.x + distortion, horizon + (horizon - q.y) * 0.82);
  float reflectedClouds = smoothstep(0.5, 0.8, fbm(vec2(reflectQ.x * aspect * 1.8 - t * 0.005, reflectQ.y * 2.2)));
  vec3 shallow = vec3(0.58, 0.9, 0.98);
  vec3 deep = vec3(0.16, 0.56, 0.76);
  vec3 water = mix(shallow, deep, smoothstep(0.02, 1.0, waterDepth));
  water = mix(water, vec3(0.80, 0.96, 1.0), reflectedClouds * 0.16 * (1.0 - waterDepth));

  float waveLines = pow(max(0.0, rippleA * 0.5 + 0.5), 9.0) * 0.16;
  waveLines += pow(max(0.0, rippleB * 0.5 + 0.5), 12.0) * 0.08;
  waveLines *= smoothstep(0.05, 0.9, waterDepth);
  float shimmerPath = exp(-abs(q.x - 0.62) * 7.0) * smoothstep(0.0, 0.34, q.y) * (1.0 - smoothstep(0.38, horizon, q.y));
  float shimmer = shimmerPath * pow(max(0.0, sin(q.y * 120.0 - t * 1.2 + rippleC)), 6.0) * 0.16;
  water += vec3(0.38, 0.7, 0.95) * waveLines + vec3(0.65, 0.92, 1.0) * shimmer;

  float horizonHaze = exp(-abs(q.y - horizon) * 38.0);
  vec3 haze = vec3(0.86, 0.97, 1.0) * horizonHaze * 0.28;
  vec3 col = mix(sky, water, waterMask) + haze;
  col += vec3(0.2, 0.14, 0.34) * smoothstep(0.55, 1.0, q.x) * smoothstep(0.1, 0.9, q.y) * 0.04;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
