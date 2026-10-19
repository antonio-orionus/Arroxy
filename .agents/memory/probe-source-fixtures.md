---
name: probe-source-fixtures
description: Check Format-screen changes against real probes of many sites (YouTube eras, 8K HDR, Shorts, VK, TikTok, Archive...) via fixtures, snapshots and "Real sites" mock scenarios, before asking the user to test live links.
metadata:
  type: project
---

Real yt-dlp probes of different sites live in `src/renderer/src/dev/probeSources/` (list and reasons in `sources.ts`). They replay through the app's own mapping (`@shared/ytdlp/formatMapping.ts`, `subtitleMap.ts`).

- `tests/unit/probe-sources.test.ts` writes one readable text file per site to `tests/unit/__snapshots__/probe-sources/`: the video grid, the audio list, and what Balanced / Best available / Smart TV 1080p / Audio only pick. After a picker, grouping or mapping change, read that diff first; update with `-u` only once the diff is understood.
- The browser mock has a "Real sites" group: `?scenario=source-<id>`.
- `bun run probe-sources:capture [ids...]` re-records them (yt-dlp from `YT_DLP` or PATH). Add a site whenever a user report shows a new format shape.

**Why:** the user asked for it after several rounds of "test these links and screenshot them" kept surfacing site-specific picker bugs (no codec names, unknown resolution, muxed + DASH at one height, AI-upscaled `-sr` streams).
**How to apply:** for any Format-screen or probe-mapping change, run the snapshot test and look at the diffs across sites before showing the user.
