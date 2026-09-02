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

**Download connections**:
How many parts of one video Arroxy fetches in parallel. Off means a single connection. Independent of pacing, which spaces requests out in time rather than widening them. Distinct from **downloads at once**, which is about queue items.
_Avoid_: fragments, threads, parallel downloads, concurrent fragments

**Downloads at once**:
How many queue items download simultaneously. Sets the normal-lane cap; the priority lane keeps reserved headroom above it so "pull now" still starts.
_Avoid_: concurrency, parallel jobs, simultaneous downloads

**Automatic retry**:
Arroxy restarting a failed item on its own, after a growing delay, for transient transport failures only. Blocked and permanently-failed downloads always wait for the user. Distinct from **resume context**, which is what makes a retry pick up partial files instead of starting over.
_Avoid_: auto-resume, self-heal, backoff retry

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

**Artifact**:
A file produced by a queue item, such as media, sidecar subtitles, a thumbnail, a description, or a companion file.
_Avoid_: payload, attachment

### Queue

**Queue**:
The ordered set of jobs waiting to run, running, or finished. It survives an app restart.
_Avoid_: list, batch

**Queue item**:
A single job's persistent entry in the queue, including its source, output target, status, and resume state.
_Avoid_: row, entry, task

**Output target**:
The folder assigned to a queue item and its artifacts.
_Avoid_: save path, output path

**Downloads view**:
The user-facing management surface where users inspect, filter, select, and act on queue items.
_Avoid_: queue view, drawer, task list

**Queue action**:
A user command applied to one or more selected queue items. It applies only where valid for each queue item's current status.
_Avoid_: bulk action, mass action

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

**Mixed URL**:
A URL that names one video and a playlist at once, so the user's intent is genuinely ambiguous.
_Avoid_: combo URL, dual URL, video+playlist URL

**Radio**:
A playlist YouTube generates on the fly around a video — personalised, endless, and different every session. Not a mixed URL: its membership is not stable, so it addresses no fixed set of videos.
_Avoid_: mix, autoplay queue, station

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
The readiness check that verifies the dependencies are present and working — fetching any that are missing — and runs at startup and again on demand from the repair flow. The media dependencies (the downloader and the media tools) gate downloads; the token warm-up is best-effort and never blocks. Verification means actually running each dependency; a passing verdict is remembered for up to seven days, as long as the file it was checked against hasn't changed.
_Avoid_: bootstrap, init, preflight

### Architecture

**Core**:
The part of Arroxy that does the work — resolving a link, choosing a format, running a job, keeping the queue. It has no opinion about how a person reaches it.
_Avoid_: engine, backend, daemon, domain layer

**Shell**:
The part that presents core to a person and supplies whatever the surrounding system provides — a window on a desktop, or a server on a network. Each way of reaching Arroxy has its own shell; core has none.
_Avoid_: host, frontend, platform layer, wrapper

**Port**:
A capability core needs but refuses to know the details of, described only as what it must be able to do. Core is written against the port; a shell supplies the real thing.
_Avoid_: interface, abstraction, contract, boundary

**Adapter**:
One shell's answer to a port — the real implementation, written in terms of what that shell actually has available.
_Avoid_: provider, implementation, driver, binding

**Composition root**:
The single place in a shell where every part is constructed and wired together. Nothing else creates its own dependencies.
_Avoid_: container, factory, bootstrap, entry point
