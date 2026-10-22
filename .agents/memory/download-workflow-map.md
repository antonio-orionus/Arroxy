---
name: download-workflow-map
description: Before changing how downloads start (URL tab, wizard steps, Quick Download, bulk, hotkey, Explore, queue attention rows), read dev-docs/download-workflows.md instead of re-tracing the code.
metadata:
  type: reference
---

`dev-docs/download-workflows.md` maps every path that ends in the download queue: entry points, which wizard steps show per mode, the five settings sources (active profile, pinned profile, per-item profiles, wizard selections, presets), where each becomes job options, known duplication, and yt-dlp bridge options the app can't reach yet. Antonio asked for it (2026-10-17) so sessions stop doing full codebase scans to answer workflow questions.

**Why:** the workflows span the renderer store, wizard components, quick-download pipeline and main queue; re-deriving them costs a long exploration every time.

**How to apply:** read it first for any workflow or UX change, verify the specific function you touch (line numbers drift), and update the map in the same PR when a workflow, step or settings source changes.
