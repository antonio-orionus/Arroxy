---
name: backdrop-webgl-scenes
description: The app background is a scene-selected WebGL backdrop: dark aurora plus light ocean, with a CSS-gradient fallback
metadata:
  type: project
---

The animated app background is **WebGL**, selected by `AppBackdrop` and rendered by `CanvasSceneHost` in `src/renderer/src/components/layout/background/`. Dark mode uses the nimitz-inspired dark aurora scene. Light mode uses a separate cheap ocean/cloud shader. When WebGL is unavailable (or rejected as software rendering), the host falls back to the CSS gradients; there is no Canvas2D fallback (removed in `fdbee81a`).

Key decisions (all learned the hard way over several wrong attempts — hand-rolled FBM streaks and snaking-ribbon shaders both failed):

- **Recolored** from nimitz's green to brand cyan→blue→violet by replacing the `col2.rgb` phase-sine line with a hue ramp driven by `gl_FragCoord.x / uRes.x` (sweep across the sky) plus a small march-depth term. Ramp by depth alone clusters all visible curtains into one hue; sweep by screen-x shows the full range.
- **Opaque canvas** (`getContext('webgl', {alpha:false})`, `gl_FragColor.w = 1.0`). Each scene owns its sky/background; glass panels float over it. Do NOT try to composite it translucently over `body::before` — see the stacking-context trap below.
- **Stacking context trap:** `#root` has `z-index:1` (its own stacking context), so a `mix-blend-mode:screen` canvas inside it can't blend against `body::before`, and a `z-index:0` positioned canvas paints *over* in-flow content. Fix = `z-index:-1` (backmost inside root) + opaque.
- **Horizon offset:** `rd = normalize(vec3(p + vec2(0.0, 0.46), 1.3))`. Without the y-offset the horizon sits at frame-center and aurora only fills the top half (lower hemisphere `rd.y<0` = dark void). The +0.46 pushes the horizon to the bottom edge so curtains fill the whole viewport.
- **Stars:** dark aurora keeps hashed twinkling dots in the upper sky. Light ocean has no stars.
- **Sharpness:** raw nimitz reads as fog. Three knobs make it read as defined curtains: `triNoise2d` return exponent `pow(rz*29.0, 1.5)` (was 1.3 = thinner brighter peaks), `aur = smoothstep(0.0, 1.15, aur)` contrast lift, and `aur.rgb = pow(aur.rgb, vec3(0.85))` gamma.
- **Render scale:** dark aurora is heavier and renders at its scene scale. Light ocean is deliberately cheaper: one fragment shader, no Three.js, no meshes, no render targets, no postprocessing.
- rAF pauses on `document.hidden`; `prefers-reduced-motion` draws one static frame. While WebGL runs, `CanvasSceneHost` sets the `backdrop-webgl-active` body class; without it (no WebGL, or a rejected software renderer) the CSS gradients show instead.

Tune the right layer:

- WebGL dark aurora: `src/renderer/src/components/layout/background/darkAurora/shader.ts`.
- WebGL light ocean: `src/renderer/src/components/layout/background/lightOcean/shader.ts`.
- CSS `--backdrop` / `--backdrop-accent` + `body::before/::after`: the no-WebGL fallback.

Verify changes via the **`?backdrop=1`** isolation stage (browser-mock; also reachable from the Scenario Gallery "Backdrop only" button), using the `http://127.0.0.1:<doctor-port>/` URL reported by `bun run doctor`, e.g. `?theme=dark&platform=linux&backdrop=1` or `?theme=light&platform=linux&backdrop=1`. Also check at least one wide desktop viewport when adjusting bloom placement: broad full-width blooms can wash out the top of the scene and reduce glass-panel contrast. Browser-mock verifies renderer visuals; Electron GPU/fallback behavior still needs the probes documented in `AGENTS.md`. See [[glow-intensity-policy]].
