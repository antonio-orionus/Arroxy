export const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;

const float AURORA_INTENSITY = 0.70;

mat2 mm2(in float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }
mat2 m2 = mat2(0.95534, 0.29552, -0.29552, 0.95534);
float tri(in float x) { return clamp(abs(fract(x) - 0.5), 0.01, 0.49); }
vec2 tri2(in vec2 p) { return vec2(tri(p.x) + tri(p.y), tri(p.y + tri(p.x))); }

float triNoise2d(in vec2 p, float spd) {
  float z = 1.8;
  float z2 = 2.5;
  float rz = 0.0;
  p *= mm2(p.x * 0.06);
  vec2 bp = p;
  for (float i = 0.0; i < 4.0; i++) {
    vec2 dg = tri2(bp * 2.0) * 0.8;
    dg *= mm2(uTime * spd);
    p -= dg / z2;
    bp *= 1.6;
    z2 *= 0.6;
    z *= 1.8;
    p *= 1.2;
    p *= m2;
    rz += tri(p.x + tri(p.y)) / z;
  }
  return clamp(1.0 / pow(rz * 29.0, 1.5), 0.0, 0.55);
}

float hash21(in vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }
vec2 hash22(in vec2 n) {
  vec2 p = vec2(dot(n, vec2(127.1, 311.7)), dot(n, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float starLayer(vec2 uv, float scale, float threshold, float minSize, float maxSize) {
  vec2 grid = uv * scale;
  vec2 id = floor(grid);
  vec2 cell = fract(grid);
  vec2 rnd = hash22(id);
  float present = step(threshold, rnd.x);
  vec2 center = 0.14 + hash22(id + 19.17) * 0.72;
  float size = mix(minSize, maxSize, rnd.y);
  float d = length(cell - center);
  float core = smoothstep(size, 0.0, d);
  float halo = smoothstep(size * 3.2, 0.0, d) * 0.22;
  float twinkle = 0.72 + 0.28 * sin(uTime * 1.35 + rnd.x * 80.0);
  return (core + halo) * present * twinkle;
}

// Star field: sub-cell points, not filled hash cells, so stars stay round and small.
vec3 stars(vec2 q) {
  vec2 uv = vec2(q.x * uRes.x / uRes.y, q.y);
  float upperSky = smoothstep(0.18, 0.44, q.y);
  float s1 = starLayer(uv + vec2(0.0, uTime * 0.002), 78.0, 0.955, 0.032, 0.07);
  float s2 = starLayer(uv * 1.43 + vec2(7.1, 2.4), 118.0, 0.976, 0.026, 0.052);
  float s3 = starLayer(uv * 2.15 + vec2(3.8, 9.6), 150.0, 0.988, 0.02, 0.04);
  vec3 tint = mix(vec3(0.52, 0.72, 1.0), vec3(0.92, 0.96, 1.0), smoothstep(0.2, 1.0, s1 + s2 + s3));
  return tint * (s1 * 0.9 + s2 * 0.62 + s3 * 0.46) * upperSky * 1.35;
}

vec4 aurora(vec3 ro, vec3 rd) {
  vec4 col = vec4(0.0);
  vec4 avgCol = vec4(0.0);
  for (float i = 0.0; i < 28.0; i++) {
    float of = 0.006 * hash21(gl_FragCoord.xy) * smoothstep(0.0, 15.0, i);
    float pt = ((0.8 + pow(i, 1.4) * 0.002) - ro.y) / (rd.y * 2.0 + 0.4);
    pt -= of;
    vec3 bpos = ro + pt * rd;
    vec2 p = bpos.zx;
    float rzt = triNoise2d(p, 0.06);
    vec4 col2 = vec4(0.0, 0.0, 0.0, rzt);
    // Brand recolor: cyan → blue → violet swept across the sky (replaces nimitz's green).
    float h = clamp(gl_FragCoord.x / uRes.x * 0.95 + i / 120.0, 0.0, 1.0);
    vec3 c1 = vec3(0.22, 0.95, 1.0);
    vec3 c2 = vec3(0.25, 0.45, 1.0);
    vec3 c3 = vec3(0.70, 0.30, 1.0);
    vec3 tint = h < 0.5 ? mix(c1, c2, h * 2.0) : mix(c2, c3, (h - 0.5) * 2.0);
    col2.rgb = tint * rzt;
    avgCol = mix(avgCol, col2, 0.5);
    col += avgCol * exp2(-i * 0.065 - 2.5) * smoothstep(0.0, 5.0, i);
  }
  col *= clamp(rd.y * 15.0 + 0.4, 0.0, 1.0);
  return col * 1.65;
}

vec4 nearAurora(vec2 q) {
  float x = q.x;
  float y = q.y;
  float drift = uTime * 0.045;

  float base = 0.32 + 0.09 * sin(x * 5.2 - 0.55 + drift) + 0.025 * sin(x * 15.0 + 1.7 - drift * 1.4);
  float upper = base + 0.36 + 0.1 * sin(x * 3.4 + 0.8 + drift * 0.6);
  float sheet = smoothstep(base - 0.015, base + 0.08, y) * (1.0 - smoothstep(upper, upper + 0.18, y));
  float height = max(y - base, 0.0);

  float warpedX = x + 0.085 * sin(y * 5.6 + x * 2.2 + drift * 2.0) + 0.035 * sin(y * 13.0 - x * 4.0);
  float broadFold = pow(0.5 + 0.5 * sin(warpedX * 15.0 - y * 4.0 + drift * 5.0), 3.4);
  float fineFold = pow(0.5 + 0.5 * sin(warpedX * 31.0 + y * 9.0 - drift * 7.0), 6.0);
  float streaks = broadFold * 0.72 + fineFold * 0.34;

  float waveY = 0.42 + 0.19 * sin((x - 0.18) * 3.15 + drift * 0.8) + 0.18 * x;
  float wave = exp(-pow((y - waveY) * 7.8, 2.0)) * smoothstep(0.05, 0.32, x) * (1.0 - smoothstep(1.0, 1.16, x));
  float ridge = exp(-pow((y - base) * 19.0, 2.0)) * (0.42 + 0.58 * sin(warpedX * 10.0 + 1.3));
  float veil = sheet * (0.035 + streaks * (0.38 + 0.32 * exp(-height * 2.4)));
  float intensity = veil + wave * 0.52 + ridge * 0.22;

  vec3 cyan = vec3(0.18, 0.92, 1.0);
  vec3 blue = vec3(0.25, 0.45, 1.0);
  vec3 violet = vec3(0.76, 0.28, 1.0);
  vec3 mint = vec3(0.56, 1.0, 0.78);
  vec3 tint = mix(cyan, blue, smoothstep(0.22, 0.6, x));
  tint = mix(tint, violet, smoothstep(0.62, 1.0, x));
  tint = mix(tint, mint, wave * smoothstep(0.18, 0.5, x) * (1.0 - smoothstep(0.62, 0.92, x)) * 0.5);

  float alpha = clamp(intensity * 0.55, 0.0, 0.72);
  return vec4(tint * intensity, alpha);
}

vec3 sky(vec3 rd) {
  float t = clamp(rd.y * 0.6 + 0.4, 0.0, 1.0);
  vec3 darkHor = vec3(0.006, 0.012, 0.035);
  vec3 darkTop = vec3(0.002, 0.005, 0.018);
  return mix(darkHor, darkTop, t);
}

void main() {
  vec2 q = gl_FragCoord.xy / uRes.xy;
  vec2 p = q - 0.5;
  p.x *= uRes.x / uRes.y;

  vec3 ro = vec3(0.0, 0.0, -6.7);
  // Push the horizon down: screen-center looks slightly upward so the sky
  // (and aurora) fills most of the frame instead of just the top half.
  vec3 rd = normalize(vec3(p + vec2(0.0, 0.46), 1.3));

  vec3 col = sky(rd);
  float fade = smoothstep(0.0, 0.01, abs(rd.y)) * 0.1 + 0.9;

  if (rd.y > 0.0) {
    vec4 aur = aurora(ro, rd) * fade;
    // Sharpen: lift contrast so curtains read as defined waves, not flat fog.
    aur = smoothstep(0.0, 1.15, aur);
    aur.rgb = pow(aur.rgb, vec3(0.85));
    aur *= AURORA_INTENSITY;
    col = col * (1.0 - aur.a) + aur.rgb * 0.68;
  }

  vec4 near = nearAurora(q);
  near *= AURORA_INTENSITY;
  col += near.rgb * 0.34;

  vec2 reflectedQ = vec2(q.x + sin(q.y * 62.0 + uTime * 0.22) * 0.012, 0.58 - q.y * 0.95);
  vec4 reflected = nearAurora(reflectedQ) * AURORA_INTENSITY;
  float reflectionMask = smoothstep(0.02, 0.18, q.y) * (1.0 - smoothstep(0.34, 0.43, q.y));
  col += reflected.rgb * reflectionMask * 0.1;
  col += stars(q) * (1.0 - near.a * 0.45);

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
