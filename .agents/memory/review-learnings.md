---
name: review-learnings
description: Standing rules the local dual review injects into every reviewer and verifier prompt — false alarms to stop raising and repo rules to check; add one whenever a finding is refuted for a reason that will recur.
metadata:
  type: feedback
---

`bun run review:dual` pastes everything below the frontmatter into each review
and verification prompt, so write entries as instructions to a reviewer. Add an
entry when a refuted finding (from Claude, Codex or CodeRabbit) would otherwise
come back on the next change; keep each one line with its reason.

- Do not raise security hardening, threat models or attack scenarios: Arroxy is a desktop app and Antonio ruled security review out of scope (2026-10-20).
- Do not ask for backward compatibility, migration paths, deprecation shims or re-exports: the repo deletes old code outright (AGENTS.md, "No backward compatibility").
- Do not flag untranslated keys in non-English locales during development: copy is translated once, right before the PR, and `check:i18n` failing on new keys is accepted until then.
- Do flag `ELECTRON_RUN_AS_NODE` reaching anything but the yt-dlp child environment (`process.env`, persisted config, other children): the packaged Electron is yt-dlp's Node runtime only.
- Do flag a raised LOC cap or `--max` override: the cap is an architecture signal, and the fix is extracting a concern.
- Do not flag a filename-template folder that collapses for flat playlist entries because the flat listing lacks the field (`{categories}`, `{album}`, `{track}`, or `{artist}` filing under the uploader): yt-dlp fills the filename at download time, and fetching every entry's full metadata was ruled out as too slow (2026-10-21).
- Do not flag a relative `output.tempDirectory`, `output.report.*` or `loadInfoJsonPath` (caller media and subtitles) as resolving against the output folder instead of the caller's cwd: the bridge contract makes those relative to `output.directory`. Only caller-owned inputs outside the output target (cookie jar, netrc, plugin folders) are caller-cwd relative (2026-10-21).
