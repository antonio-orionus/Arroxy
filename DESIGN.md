---
name: Arroxy
description: Free, open-source desktop downloader for YouTube + 2000 sites. Dark + light aurora modes, electric-blue signal, glass panels.
colors:
  brand: "#1f69ff"
  brand-hover: "#4d88ff"
  bg-base: "#070a12"
  surface-glass: "#121621"
  surface-raised: "#171c2b"
  ink: "#f1f1f9"
  ink-muted: "#9aa3c4"
  ink-subtle: "#6b738f"
  border-hairline: "#ffffff14"
  border-glow: "#1f69ff66"
  status-done: "#1ec87b"
  status-paused: "#ffc042"
  status-error: "#ff385d"
typography:
  display:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Poppins, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Poppins, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Poppins, sans-serif"
    fontSize: "0.5625rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.12em"
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "10px"
  md: "13px"
  lg: "16px"
  xl: "22px"
  2xl: "28px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 14px"
    height: "32px"
    typography: "{typography.title}"
  button-primary-hover:
    backgroundColor: "{colors.brand-hover}"
  button-ghost:
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.lg}"
    height: "32px"
  panel-glass:
    backgroundColor: "{colors.surface-glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  input-url:
    backgroundColor: "{colors.surface-glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "44px"
    padding: "0 16px"
  radio-option-active:
    backgroundColor: "{colors.border-glow}"
    textColor: "{colors.brand}"
    rounded: "{rounded.md}"
---

# Design System: Arroxy

## 1. Overview

**Creative North Star: "The Aurora Console"**

Arroxy is a console where one electric-blue signal does all the talking. In its native dark mode the window opens onto a near-black navy void with a soft aurora bloom drifting through the top corners; everything the user touches, the URL field, the Quick Download tile, the active profile, sits on glass that catches that blue light along its edges. The mood is cinematic but never loud: color arrives as *signal*, a glowing primary action, a status pulse, a selected option, not as wallpaper. This is the friendly front of "friendly front, expert core": a non-technical user pastes a link into a calm, beautiful surface and feels like the machinery behind it is powerful and in control.

The system ships **two complete skies**. Dark is the canvas it was born for; light is a true peer, not an afterthought. In light mode the void inverts to a luminous cool-blue *field*, glass becomes frosted white with the same blue-lit edges, and the aurora bloom softens to a pale wash in the corners. The same electric-blue signal and the same status colors carry across both; only the neutrals flip. A user toggling modes should feel the same product, lit differently, never two different apps.

The system is unapologetically branded. It rejects the flat gray SaaS dashboard, the cookie-cutter card grid, and above all the ad-choked sketchy-downloader look that Arroxy exists to replace. Where a generic tool would ship neutral chrome, Arroxy commits to a single saturated identity (deep aurora navy + electric blue) and lets restraint come from *discipline*, not from desaturation: glow is reserved for things that are live, primary, or changing state. Glass is reserved for surfaces that float above the void. Used everywhere, both become slop; used as signal, they become the brand.

Navigation lives in a horizontal tab bar at the top (Download / Profiles / Settings), under a slim title bar. The primary screen is a vertical flow, not a grid: Download input → Quick Download + Active Profile → Interactive / Bulk rows → a Tip helper. The mascot appears at rest, never as decoration competing with content.

**Key Characteristics:**
- Dark-default, but a true light mode too; the void inverts to a luminous field, the signal stays.
- One electric-blue brand signal; color = state, not decoration.
- Glass surfaces float above an aurora-lit navy void.
- Generous rounding (16-28px on panels) reads soft, modern, approachable.
- Poppins throughout; JetBrains Mono for sizes, codes, byte counts.
- Friendly, human copy ("Pull it! ↓", "Fetch formats →"), never corporate.

## 2. Colors

A single electric blue carries identity across two skies, a deep aurora-navy void (dark) and a luminous cool-blue field (light); status colors (green / amber / red) speak only for queue state in both.

### Primary (constant across modes)
- **Electric Blue** (`#1f69ff`, `hsl(220 100% 56%)`): The one voice. Primary action fills (Quick Download, Pull it!), the active-profile selection, focus rings, progress fill, selected radio options, and the aurora bloom's core hue. The only saturated color a user sees on a calm screen. Identical in both modes.
- **Blue Lift** (`#4d88ff`, `hsl(220 100% 65%)`): Hover/active state of the primary; the lighter end of the progress-bar gradient. Brightens on interaction so the press feels lit.

### Neutral — Dark (the void)
- **Void** (`#070a12`, `hsl(225 45% 5%)`): App background. Near-black navy, not pure black, so the aurora has something to tint. Deeper than the old `hsl(240 20% 6%)`.
- **Glass Surface** (`#121621`, `hsl(225 30% 10%)` at ~85% opacity): Default panel material. Translucent with backdrop blur so the aurora reads through.
- **Raised Glass** (`#171c2b`, `hsl(225 28% 13%)`): Popovers, dropdowns, the active-profile card. Floats above another glass surface.
- **Ink** (`#f1f1f9`, `hsl(240 40% 96%)`): Primary text.
- **Ink Muted** (`#9aa3c4`, `hsl(228 24% 69%)`): Secondary text. Verified ≥4.5:1 on Void and Glass Surface.
- **Ink Subtle** (`#6b738f`, `hsl(228 15% 49%)`): Labels, placeholders, metadata. Label sizes / large text only.
- **Hairline** (`#ffffff14`, `hsla(0 0% 100% / 0.08)`): Border on glass. A whisper.
- **Glow Border** (`#1f69ff66`, `hsl(220 100% 56% / 0.4)`): The lit edge on active/primary/focused surfaces.

### Neutral — Light (the field)
- **Field** (`#f1f3f9`, `hsl(225 40% 96%)`): App background. A cool, faintly blue near-white, never warm cream. The aurora is a pale blue-violet wash in the corners, not a glow.
- **Glass Surface** (`#ffffff` at ~70% opacity over the field, blurred): Default panel material. Frosted white; the field shows through softly.
- **Raised Glass** (`#ffffff`, opaque): Popovers, dropdowns, the active-profile card.
- **Ink** (`#141429`, `hsl(240 35% 12%)`): Primary text. Deep navy, not pure black.
- **Ink Muted** (`#5b5b7b`, `hsl(240 15% 42%)`): Secondary text. Verified ≥4.5:1 on Field and white glass.
- **Ink Subtle** (`#9a9aac`, `hsl(240 10% 64%)`): Labels, placeholders, metadata. Label sizes / large text only; never body prose.
- **Hairline** (`#dbdee6`, `hsl(220 18% 88%)`): Border on glass. A soft cool-gray line.
- **Glow Border** (`#1f69ff40`, `hsl(220 100% 56% / 0.25)`): Same blue edge, slightly softer alpha so it reads against the bright field.

### Tertiary (status only)
- **Done Green** (`#1ec87b`, `hsl(153 74% 45%)`): Completed jobs. Paired with `hsl(153 74% 45% / 0.05)` glow.
- **Paused Amber** (`#ffc042`, `hsl(40 100% 63%)`): Paused jobs, warnings (e.g. unsigned-build splash note).
- **Error Red** (`#ff385d`, `hsl(349 100% 61%)`): Failed jobs, destructive actions, invalid input. Always paired with an icon and text; never color-alone.

### Named Rules
**The Two-Sky Rule.** There are exactly two skies: the dark **void** and the light **field**. The electric-blue signal and the status colors are identical in both; only the neutrals flip. Toggling mode must feel like the same product lit differently, never a recolored second app. The light field is cool-blue, never warm cream/sand/beige.

**The Lit-Edge Rule.** Glass panels catch the blue light along their edges: a luminous 1px ring is the *default* panel finish, not an exception. This is the Aurora Console look. What's rationed is **intensity**, not presence: secondary panels get a soft edge ring; the one primary action per view (Quick Download) gets the brightest ring plus a real outer bloom. Two things may both glow; only one may glow *brightest*.

**The One Voice Rule.** Electric Blue is the only saturated non-status hue anywhere, the edge light, the bloom, the aurora core, the primary fill, the selection. No second accent competes. Saturated *fill* (as opposed to an edge ring) stays reserved for the primary action and the current selection.

**The Aurora-Is-Intentional Rule.** The background bloom is deliberate atmosphere, a real light source the glass floats on, not stray decoration. It is bright and present (a nebula top-right, a violet wash left), never a faint afterthought. It lives only on the fixed canvas behind content; never blurred, never painted onto a scrolling surface.

**The Status-Plus-Icon Rule.** Done / Paused / Error never communicate by color alone. Every status color ships with an icon and a text label, because color blindness and locale both have to read it.

## 3. Typography

**Display / Body Font:** Poppins (with `sans-serif` fallback). One family, weight-driven hierarchy.
**Mono Font:** JetBrains Mono (with `monospace`). Filesizes, byte counts, format codes, resolutions, percentages, durations.

**Character:** Poppins is geometric, round, and friendly, the typographic half of "approachable." Its circular bowls echo the generous panel rounding. JetBrains Mono handles anything tabular so numbers don't jitter as they tick. Do not reintroduce Outfit or Geist; do not add a third UI family.

### Hierarchy
- **Display** (700, 1.5rem/24px, -0.02em): Screen-level titles ("Download input"). One per view.
- **Headline** (600, 1.125rem/18px, -0.01em): Card titles ("Quick Download"), dialog titles.
- **Title** (600, 0.9375rem/15px): Button labels, row titles, the active profile name.
- **Body** (400, 0.875rem/14px, 1.5): Descriptions, helper text, prose. Cap prose at 65-75ch.
- **Label** (700, 0.5625rem/9px, 0.12em, UPPERCASE): Section eyebrows ("ACTIVE PROFILE", "DOWNLOAD INPUT"). Reserved for ≤4-word labels; never sentences.
- **Mono** (400, 0.8125rem/13px): Numeric/technical values inline. `font-variant-numeric: tabular-nums` so progress counters don't shift width.

### Named Rules
**The Tabular-Numbers Rule.** Any number that updates live (progress %, downloaded bytes, ETA) renders in JetBrains Mono with `tabular-nums`. Proportional digits that reflow on every tick are forbidden.

**The Uppercase-Label-Only Rule.** All-caps is for the 9px section eyebrow and badges only. No all-caps headings, no all-caps buttons, no all-caps body. ≤4 words or it isn't a label.

## 4. Elevation

Depth is **glass over an aurora-lit canvas, lit at the edges**. Not flat tonal layering, not soft drop-shadow lift. Two glass materials, both translucent so the bloom reads through, both edged with a luminous blue ring:

- **`glow-panel`** — the outermost / standalone surface (the Download input panel, the Tip card, a manage card). Owns the backdrop blur (~16px), a diagonal inner sheen, a 1px blue edge ring, a top highlight, and a soft outer bloom (`--panel-glow`).
- **`glow-tile`** — a tile that lives *inside* a glow-panel (Quick Download, the active-profile card, the action rows). Same lit edge + gradient, **no backdrop blur of its own** (the parent already blurred the canvas; re-blurring blurred content only muddies it). One blur layer per stack.
- **`glow-tile-primary`** — the one primary tile. Brighter ring (`hsl(212 100% 62% / 0.65)`) plus a genuine outer bloom (`0 0 44px -6px`). This is the brightest thing on the screen.

Glow carries meaning at two intensities: the soft edge ring says "this is a surface in the Aurora Console"; the bright bloom says "primary / live". Status glow (green/amber/red, very low alpha) tints a completed/paused/failed row.

### Shadow Vocabulary
- **Panel glow** (`--panel-glow`): the ambient bloom under every glow-panel/tile. Mode-aware.
- **Primary bloom** (`0 0 44px -6px hsl(218 100% 56% / 0.5)`): only the primary tile. The lit-from-within hero.
- **Edge ring** (`inset 0 0 0 1px var(--glow-border)`): the luminous 1px edge on every glass surface.
- **Focus ring** (`box-shadow: 0 0 0 3px var(--ring)/0.5`): keyboard focus on any control.
- **Selection ring** (`box-shadow: 0 0 0 2px var(--brand-dim)`): the active radio option / selected profile.
- **Progress glow** (`box-shadow: 0 0 8px var(--brand-glow)` on the indicator): the download bar reads as energy moving.

### Named Rules
**The Glass-Floats, Background-Recedes Rule.** Only floating/elevated surfaces are glass. The background, void in dark, field in light, is never glass and never blurred; it is the solid canvas the aurora lives in. Glass is frosted white (~60%) in light, translucent navy (~55%) in dark, both lit at the edge.

**The One-Blur Rule.** Exactly one element in any nested stack owns the backdrop blur (the `glow-panel`); tiles inside it use `glow-tile` (no blur). Never stack backdrop-blurs, blurring already-blurred glass turns it to mud and costs frames. Edge rings and glow may nest freely; blur may not.

**The Bloom-Is-Rationed Rule.** The soft edge ring is the default and may appear on every glass surface. The bright *outer bloom* is rationed: one primary tile per view, plus genuine live/focused states. If three things on a screen have a strong outer bloom, two are wrong, dial them back to the edge ring.

## 5. Components

### Buttons
- **Shape:** 16px radius (`{rounded.lg}`), compact 32px height. Icon buttons are square at the same height.
- **Primary:** Electric Blue fill, Ink label, soft primary glow beneath (`0 4px 14px var(--brand-glow)`). Used for the single most important action per view (Pull it!, Quick Download). Hover lifts to Blue Lift; active nudges `translate-y-px`.
- **Hover / Focus:** All buttons transition `all` ~150-200ms. Focus-visible draws the 3px brand ring.
- **Secondary / Outline / Ghost:** Secondary uses Glass Surface fill; outline uses a hairline border over transparent; ghost is text-only until hover tints it with `muted`. Everything that isn't the one primary action lives here.
- **Destructive:** Low-alpha Error Red fill (`destructive/10`) with Error Red text, not a solid red block. Hover deepens the alpha.

### Inputs / Fields
- **Style:** Glass Surface fill, hairline border, 16px radius. The URL field is the hero input: taller (~44px), generous horizontal padding, a leading link/clipboard icon, a trailing primary add (`+`) affordance.
- **Focus:** Border shifts to brand, 3px brand ring glow. The field lights up when active, reinforcing One Voice.
- **Placeholder:** Ink Subtle, but must still clear 4.5:1; "Paste a URL…" sits in muted, not faint.
- **Error / Disabled:** Error draws the destructive border + low-alpha ring; disabled drops to 50% opacity, no pointer.

### Cards / Panels
- **Corner Style:** Large, 22-28px (`{rounded.xl}`-`{rounded.2xl}`) on hero panels (Download input, Quick Download); 13-16px on list rows.
- **Background:** Glass Surface over void; raised glass for the active-profile card so it reads as the live selection.
- **Border:** Hairline at rest. Glow Border when the panel is the primary/active surface (Quick Download tile, selected profile).
- **Shadow Strategy:** Primary glow only on the primary tile; everything else relies on the glass/hairline step. See Elevation.
- **Internal Padding:** 20px on hero panels, 12-16px on rows. No nested cards.

### Navigation
- **Style:** Horizontal top tab bar (Download / Profiles / Settings) with a leading icon per tab, under a slim custom title bar (window controls + share/min/max). Active tab: Ink label + brand underline/indicator + subtle glow; inactive: Ink Muted, no glow. Tabs are the only top-level nav; no left sidebar.
- **Title bar:** Draggable region, frameless-window controls, app name + mascot lockup at the leading edge.

### Radio Options / Profile Picker (signature)
- **Style:** Compact rows (`Item` primitive). Unselected: transparent, Ink Muted label, hover tints with `accent`. Selected: `--brand-dim` fill + `0 0 0 2px var(--brand-dim)` selection ring + brand-colored, semibold label, brand radio dot. This is how "current choice" reads everywhere (download profile, save location, format preset).

### Tip / Helper card (signature)
- A friendly, low-stakes glass card (mascot + one tip line + a "Got it" dismiss). Warm, human, never a modal. It teaches without blocking.

### Queue card (signature)
- Glass row carrying thumbnail (shimmer placeholder while loading), title, status, and a `progress-glow` bar. Status tint (done/paused/error) applies as a very low-alpha background glow + icon, never a loud fill. Enters with a 0.18s `card-enter` slide.

## 6. Do's and Don'ts

### Do:
- **Do** keep Electric Blue as the One Voice: one primary glow per calm screen, color for state only.
- **Do** make glass float above the solid void; backdrop-blur the panels, never the background.
- **Do** tie every glow to a state (primary / focused / live / status). If it doesn't mean something, delete it.
- **Do** render live numbers in JetBrains Mono with `tabular-nums`.
- **Do** pair every status color with an icon and text (color blindness + 21 locales incl. RTL).
- **Do** ship both skies as peers: dark void and light cool-blue field, same blue signal, same status colors, only neutrals flip.
- **Do** use big rounding (16-28px) on hero panels for the friendly, approachable read.
- **Do** honor `prefers-reduced-motion`: glows stay (they're static state), but slide/float/shimmer/pulse animations collapse to instant or crossfade.
- **Do** keep copy human and plain ("Pull it! ↓", "Fetch formats →"), verb + object on every button.

### Don't:
- **Don't** let it look like a **sketchy downloader site**: no ad-shaped blocks, no fake-button bait, no upsell chrome. The clean glass surface is the proof of trust.
- **Don't** ship the **generic gray SaaS dashboard** or the identical icon+heading+text card grid. Arroxy commits to one saturated identity.
- **Don't** expose **raw yt-dlp flag soup**; depth (formats, SponsorBlock, subtitle modes) lives behind the friendly wizard, never in the newcomer's face.
- **Don't** make it a **bloated legacy media suite**: no modal stacks, no clutter. Exhaust inline/progressive before reaching for a modal.
- **Don't** blur the background canvas or stack backdrop-blurs (One-Blur Rule). Blurring blurred glass turns it to mud and costs frames.
- **Don't** give three+ surfaces a strong *outer bloom*; the bright bloom is the primary tile's. Everything else gets the soft edge ring (Bloom-Is-Rationed).
- **Don't** make the light field warm: no cream / sand / beige / parchment near-white. The light sky is cool-blue, the dark sky's inverse, never a warm-neutral default.
- **Don't** treat light mode as a second-class recolor; both skies are designed peers.
- **Don't** use side-stripe borders (`border-left`/`right` > 1px as a colored accent), gradient text (`background-clip: text`), or all-caps body copy.
- **Don't** reintroduce Outfit or Geist, or add a third UI font family.
- **Don't** use em dashes in UI copy; use commas, colons, periods, or parentheses.
