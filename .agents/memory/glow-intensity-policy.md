---
name: glow-intensity-policy
description: Where the bold neon-aurora glow belongs vs where calmer variants belong across Arroxy screens
metadata:
  type: feedback
---

The branded neon / aurora / glass glow vocabulary (`glow-panel` + `glow-tile`, the "Aurora Console" look in DESIGN.md) is intentional on the **home / main download screen** (`DownloadProfilesHome` download tab). The user explicitly confirmed this is the desired art direction, not generic over-glow. Do **not** flatten or remove the home screen's branded glow language; current token values in `src/renderer/src/styles.css` remain the source of truth for exact intensity.

Calmer, lower-intensity glow belongs on **dense / utilitarian surfaces**: settings tables, dialogs, logs, and queue screens. The stage each tab sits on is one `Card variant="glass"` (`glow-panel`, see `ui/card.tsx`: one per view, it owns the backdrop blur), so the Downloads, Settings, Manage and Explore tabs all have a lit stage by design. Restraint applies to what sits *on* the stage: rows, tables and status use plain `Card`/`--border-strong` or the low-alpha status glow (`--color-status-*-glow`), not extra `glow-tile`s. The Quick Download progress dialog's live-status tile was the last dialog `glow-tile`; Antonio chose to calm it to `Card variant="inset"` (2026-10-21), so dialogs carry no lit tiles.

**Why:** A first design critique claimed the home UI "over-glows" and recommended flattening it. The user corrected course: the glow vocabulary is part of the brand identity and the home should keep it; restraint is reserved for density, where bold glow would be noisy during real daily use.

**How to apply:** New home/hero surfaces → use the established glow utilities unless the current design tokens have a more specific local class. New dense content (tables, dialogs, logs, queue rows) → plain `Card`/`--border-strong` or low-alpha status glow on the view's one glass stage, not another `glow-panel`/`glow-tile`. If a calmer glow *vocabulary* is ever needed, add it then (don't keep speculative unused utilities). See DESIGN.md "Bloom-Is-Rationed Rule" and "Lit-Edge Rule" for the underlying intensity discipline.
