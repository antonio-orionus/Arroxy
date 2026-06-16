# Arroxy Domain Context

The canonical glossary for Arroxy. Every entry below is a domain term you can use
to explain how the app works — in a PR, a support reply, or a translation note —
without any code detail. It is a glossary and nothing else: no module names, no
function names, no constants, no decisions. Implementation lives in the code (the
source of truth); architectural decisions live in `docs/adr/`.

When two words exist for one concept, the canonical word is the bold heading and
the rejected alternatives are listed under `_Avoid_`. Use the canonical word in
code, UI copy, docs, and every locale.

## Language

### Download

**Job**:
One download attempt for a single video. It runs, then ends as complete, failed, or cancelled.
_Avoid_: task, download, pull, attempt

**Phase**:
One step inside a running job — fetching the media, merging audio and video, embedding subtitles or metadata.
_Avoid_: stage, step

**Soft failure**:
A non-fatal miss that still leaves a usable result, so the job finishes as complete. Subtitles that could not be fetched are the typical case — the video is kept.
_Avoid_: warning, partial failure

**Hard failure**:
A fatal error that ends a job with no usable result.
_Avoid_: crash, fatal error

**Resume context**:
The saved state that lets a paused or failed job restart from its partial files instead of starting over. Only certain media failures are resumable.
_Avoid_: checkpoint, savepoint, retry state

**Status**:
The labelled phase or outcome a job is currently in — preparing, downloading, merging, complete, error.
_Avoid_: state

**Progress**:
The live percentage and detail line within the current phase. Distinct from status: status is *which* phase, progress is *how far* through it.
_Avoid_: percent

### Queue

**Queue**:
The ordered set of jobs waiting to run, running, or finished. It survives an app restart.
_Avoid_: list, batch

**Queue item**:
A single job's persistent entry in the queue, including its source, output target, status, and resume state.
_Avoid_: row, entry, task

**Lane**:
The scheduling tier of a queue item. A normal-lane item respects the simultaneous-download cap and the pacing delay between starts; a priority-lane item skips the pacing delay but still respects the hard cap.
_Avoid_: tier, track, priority level

**Held pause**:
A queue item paused before it ever started running. Resuming simply lets it start.
_Avoid_: queued pause, idle pause

**Active pause**:
A queue item paused after its download had already begun. Resuming continues from its partial files, even across an app restart.
_Avoid_: live pause, running pause

### Wizard

**Wizard**:
The guided step flow that takes a user from a URL, through format choice and save location, to a final confirmation.
_Avoid_: flow, stepper, form

**Probe**:
Inspecting a URL to discover its title, available formats, and metadata before any download starts.
_Avoid_: fetch, inspect, scan, lookup

**Preset**:
A named quality choice for a single download — best quality, balanced, small file, audio-only, subtitle-only.
_Avoid_: quality, mode, profile

**URL intent**:
The classification of a pasted URL as a single video, a playlist, a mix of both, or unknown.
_Avoid_: URL type, URL kind

**Playlist**:
A source URL that expands into multiple videos queued together — including a channel or a search, which Arroxy treats as playlists. The URL classifier may still tag the source as playlist, channel, or search for routing.
_Avoid_: collection, batch

### Profiles and quick download

**Download profile**:
A saved, reusable set of download settings the user applies in one click, without walking the wizard.
_Avoid_: preset, template, config

**Quick download**:
Starting a download straight from a saved profile, skipping the wizard steps.
_Avoid_: instant download, one-click download

### Subtitles

**Sidecar subtitles**:
Subtitles saved as a separate file alongside the video.
_Avoid_: external subtitles

**Embedded subtitles**:
Subtitles muxed into the video file as a selectable track.
_Avoid_: burned-in, hardcoded, baked-in subtitles

### Binaries and runtime

**Dependency**:
One of the external programs Arroxy drives to do its work — the downloader and the media tools it relies on.
_Avoid_: binary, tool, executable

**Binary manifest**:
The versioned list that tells Arroxy which managed binary build to fetch for the current platform.
_Avoid_: index, build list

**Managed binary**:
A dependency Arroxy downloads and caches itself, as opposed to one bundled inside the app or found already installed on the system.
_Avoid_: downloaded binary, fetched binary

**Warmup**:
The startup readiness check that verifies the dependencies are present and working — fetching any that are missing — before downloads are allowed.
_Avoid_: bootstrap, init, preflight
