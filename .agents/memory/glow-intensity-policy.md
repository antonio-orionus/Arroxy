---
name: glow-intensity-policy
description: Where the bold neon-aurora glow belongs vs where calmer variants belong across Arroxy screens
metadata:
  type: feedback
---

The branded neon / aurora / glass glow vocabulary (`glow-panel` + `glow-tile` + `glow-tile-primary`, the "Aurora Console" look in DESIGN.md) is intentional on the **home / main download screen** (`DownloadProfilesHome` download tab). The user explicitly confirmed this is the desired art direction, not generic over-glow. Do **not** flatten or remove the home screen's branded glow language; current token values in `src/renderer/src/styles.css` remain the source of truth for exact intensity.

Calmer, lower-intensity glow belongs on **dense / utilitarian surfaces**: settings tables, dialogs, logs, and queue screens. As of this writing those are already calm in the code — settings uses a plain `Card` + `--border-strong` (no `glow-panel`), dialogs don't use the home glow utilities, and queue cards use low-alpha status glow (`--color-status-*-glow` at 0.05). So the policy is already satisfied; the rule is to keep it that way.

**Why:** A first design critique claimed the home UI "over-glows" and recommended flattening it. The user corrected course: the glow vocabulary is part of the brand identity and the home should keep it; restraint is reserved for density, where bold glow would be noisy during real daily use.

**How to apply:** New home/hero surfaces → use the established glow utilities unless the current design tokens have a more specific local class. New dense surfaces (tables, dialogs, logs, queue rows) → plain `Card`/`--border-strong` or low-alpha status glow, not `glow-panel`/`glow-tile`. If a calmer glow *vocabulary* is ever needed, add it then (don't keep speculative unused utilities). See DESIGN.md "Bloom-Is-Rationed Rule" and "Lit-Edge Rule" for the underlying intensity discipline.
