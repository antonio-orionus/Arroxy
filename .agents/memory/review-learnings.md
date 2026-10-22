---
name: review-learnings
description: Standing rules the local dual review injects into every reviewer and verifier prompt — false alarms to stop raising and repo rules to check; add one whenever a finding is refuted for a reason that will recur.
metadata:
  type: feedback
---

The local dual review (the maintainer's global `dual-review` skill) pastes everything below the frontmatter into each review
and verification prompt, and CodeRabbit reads this file as a code guideline
(`knowledge_base.code_guidelines` in `.coderabbit.yaml`), so write entries as
instructions to a reviewer. Add an
entry when a refuted finding (from Claude, Codex or CodeRabbit) would otherwise
come back on the next change; keep each one line with its reason.

- Do not raise security hardening, threat models or attack scenarios: Arroxy is a desktop app and Antonio ruled security review out of scope (2026-10-20).
- Do not ask for backward compatibility, migration paths, deprecation shims or re-exports: the repo deletes old code outright (AGENTS.md, "No backward compatibility").
- Do not flag untranslated, missing or stale keys in non-English locales, and do not ask a PR to translate: PRs change English only and the release sync translates (ADR 0017). Do flag a PR that edits `i18n/**`, non-English locale JSON or non-English README locales, or that changes a string's meaning or placeholders under its old key. The one exception is the release's translation sync PR, titled `i18n: sync translations`: editing those files is its whole job.
- Do flag a user-facing PR that adds no `changelog.d/` fragment, and any new section or entry in `CHANGELOG.md` outside a `release: X` commit: PRs write fragments and only the release commit assembles them (AGENTS.md, Release Pipeline).
- Do flag a changelog fragment added by a PR for release-flagged work: users cannot reach it yet, so its fragment belongs to the PR that turns the flag on (`dev-docs/release-flags.md`).
- Do flag an `isReleaseFlagOn` check that gates logic (a service, store, parser or behaviour) rather than an entry point (menu item, button, route, settings row, IPC or preload exposure): turning a flag on must change only reachability (`dev-docs/release-flags.md`).
- Do flag `ELECTRON_RUN_AS_NODE` reaching anything but the yt-dlp child environment (`process.env`, persisted config, other children): the packaged Electron is yt-dlp's Node runtime only.
- Do flag a raised LOC cap or `--max` override: the cap is an architecture signal, and the fix is extracting a concern.
- Do not flag a filename-template folder that collapses for flat playlist entries because the flat listing lacks the field (`{categories}`, `{album}`, `{track}`, or `{artist}` filing under the uploader): yt-dlp fills the filename at download time, and fetching every entry's full metadata was ruled out as too slow (2026-10-21).
- Do not flag a relative `output.tempDirectory`, `output.report.*` or `loadInfoJsonPath` (caller media and subtitles) as resolving against the output folder instead of the caller's cwd: the bridge contract makes those relative to `output.directory`. Only caller-owned inputs outside the output target (cookie jar, netrc, plugin folders) are caller-cwd relative (2026-10-21).
- Do not report yt-dlp's own behaviour (fragment resume, output order, how an option works) as an Arroxy bug without citing yt-dlp's source or docs for it: those findings were refuted (#446, 2026-10-22).
- Do not predict a platform-specific failure (Windows paths, permissions, macOS signing) without naming the code path that fails: CI runs Windows, macOS and Linux, and such guesses were refuted by green CI (#461, 2026-10-22).
- Do not repeat a finding the PR body's Review line lists as refuted unless you add evidence that refutation missed (#416, 2026-10-22).
