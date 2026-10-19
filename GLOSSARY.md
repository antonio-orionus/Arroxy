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

**Rate-limit cooldown**:
The wait Arroxy imposes on new requests to a site after that site rate-limits this connection, one per site and network route. Probes, queued downloads and automatic retries all wait it out; **Try now** lets one request through. A rate limit never brings in an account, because sites rate-limit signed-in accounts too.
_Avoid_: backoff, throttle, ban

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
A file produced by a queue item, such as media, sidecar subtitles, a thumbnail, a description, or a companion file. An artifact is **missing** when it is no longer on disk, for example after being moved or deleted outside the app; the queue checks this each time it loads and clears the mark when the file is back.
_Avoid_: payload, attachment

**Copied link**:
The latest single link the clipboard watch saw while Arroxy was in front: a clipboard holding exactly one web link and nothing else. It replaces the URL field without asking, with an Undo, as soon as the Download tab is idle; until then it waits, and a newer copy takes its place.
_Avoid_: pending link, clipboard candidate, suggested link

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
The guided step flow behind Interactive Download. For a single video it is two screens, Format and Review; a playlist or batch walks its own steps to a final confirmation.
_Avoid_: flow, stepper, form

**Probe**:
Inspecting a URL to discover its title, available formats, and metadata before any download starts.
_Avoid_: fetch, inspect, scan, lookup

**Media kind**:
What a single-video download produces: video, audio, or subtitles only. Picked on the Format screen.
_Avoid_: preset, mode, type

**Format mode**:
The Format screen's switch, named like a profile's media: Video + audio, Video, no audio, Audio only, Subtitles only. Video, no audio is the video media kind with no audio and a stream that has none of its own.
_Avoid_: media type, tab

**Stream marker**:
What yt-dlp's notes say about one stream beyond its size and codec: AI upscaled, AI dubbed, audio description, spatial audio, 360° / VR, enhanced bitrate, damaged, watermarked. The Format screen tags each one.
_Avoid_: flag, badge, quirk

**Probe source**:
A real probe of one site or kind of video, kept as a fixture so the Format screen can be checked against it without probing. Each has a text snapshot and a "Real sites" Scenario Workbench state.
_Avoid_: sample, recording

**Profile pick**:
The streams and settings a download profile gives one particular video, shown pre-selected in the wizard. Changing anything is a per-download edit; keeping it means updating that profile or saving a new one.
_Avoid_: default, preset, remembered choice

**Part of video**:
A time range of one video, picked on the Format screen and downloaded on its own instead of the whole video. Its file name ends in the range (`[3m40s-7m15s]`) after the video id. Never part of a download profile.
_Avoid_: clip, trim, section, cut

**Fit notice**:
A warning that a video can't honour part of the download profile (a resolution, MP4, subtitle languages), naming what was picked instead.
_Avoid_: fallback, mismatch error

**Feature callout**:
A one-time card in the page flow that points to a capability people may not have noticed yet, placed where that capability lives. Closing it, or using the feature, retires it for good: it does not return on another video or after a restart. Not a hover bubble, and not a warning.
_Avoid_: tip, hint, alert, nudge, onboarding, coach mark

**URL intent**:
The classification of a pasted URL as a single video, a playlist, a mix of both, or unknown.
_Avoid_: URL type, URL kind

**Playlist**:
A source URL that expands into multiple videos queued together — including a channel or a search, which Arroxy treats as playlists. The URL classifier may still tag the source as playlist, channel, or search for routing.
_Avoid_: collection, batch

**Mixed URL**:
A URL that names one video and a playlist at once, so the user's intent is genuinely ambiguous.
_Avoid_: combo URL, dual URL, video+playlist URL

**Placeholder title**:
A fabricated row title (`Untitled · #N`) the probe emits when a flat listing gives no real title. It is a stand-in, never shown to the user as final, and is replaced the moment a real title is known.
_Avoid_: fake title, stub title, temp title

**Hydration**:
Filling placeholder rows in with real per-row metadata through follow-up probes, while the user keeps working. Bounded concurrency, cancellable, and always optional — the user may proceed without waiting for it.
_Avoid_: enrichment, backfilling rows, resolving

**Title backfill**:
Replacing a placeholder title on a queue item after it has already been queued, either from a late probe or from the name of the landed artifact. Distinct from hydration, which happens before queueing.
_Avoid_: late naming, title repair

**Playlist sort mode**:
The order the playlist picker displays rows in — probe order as given, or by upload date ascending or descending. A view concern: it never rewrites row identity, and rows with no known upload date sort last.
_Avoid_: ordering, row order, sort key

**Radio**:
A playlist YouTube generates on the fly around a video — personalised, endless, and different every session. Not a mixed URL: its membership is not stable, so it addresses no fixed set of videos.
_Avoid_: mix, autoplay queue, station

### Profiles and quick download

**Download profile**:
A saved, reusable set of download settings the user applies in one click, without walking the wizard.
_Avoid_: preset, template, config

**Selection order**:
The ranked rules a download profile uses to choose one video and one audio stream out of everything a video offers, best first: streams the site doesn't mark down, original streams before AI-upscaled ones (unless the profile allows them), resolution limit, codec, frame rate, HDR, file size, then the audio language and track. The same order drives Quick and Interactive Download, and the app shows it.
_Avoid_: priority, hierarchy, ranking, sort

**Profile goal**:
What a download profile's video is for, which decides the codec its selection order prefers: Best picture (the newest, most efficient codecs) or Smart TV (the codec every device plays).
_Avoid_: codec, compatibility, native

**File type**:
The kind of file a download is saved as, such as MP4, MKV or WebM. Auto lets the chosen streams decide.
_Avoid_: container, extension, format

**Remux**:
Copying streams into another file type without re-encoding them: fast and lossless, but only possible when the file type can hold those codecs.
_Avoid_: convert, transcode, re-encode

**Quick download**:
Starting a download straight from a saved profile, skipping the wizard steps. A single link prepares in the background as a placeholder row in Downloads, so several can prepare at once and nothing waits on the window.
_Avoid_: instant download, one-click download

**Placeholder row**:
The row a quick download puts in Downloads the moment a link is taken in, before its probe has answered. It has no job yet and never starts by itself; once the probe answers it becomes the queued items, a probe-error row, or a row that needs your choice. Cancelling it simply removes it.
_Avoid_: pending row, stub row, ghost row

**Probe-error row**:
A placeholder row whose probe failed. It carries the same guidance as any failed probe and is resolved from the row: retry, enable cookies and retry, open cookie settings, or sign in in Explore.
_Avoid_: failed download (nothing downloaded), broken row

**Needs your choice**:
A placeholder row waiting for a decision only the user can make once the link is probed: how much of a playlist that went past the load limit to queue (all, the first N, or a review), or whether to review a link that turned out to be a playlist. It keeps waiting across a restart.
_Avoid_: pending decision, blocked row, needs review

**Needs attention**:
A row only the user can move on — a probe-error row or one that needs your choice. The Downloads tab counts them.
_Avoid_: alerts, problems, warnings

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

**Download engine**:
What the user sees the downloader called. On-screen copy says "Arroxy" when it describes what the app did, and "the download engine" only for the updatable part underneath. The tool's real name appears only where the user needs it: installing it by hand, searching an error, or a link to its own pages.
_Avoid_: naming the downloader in on-screen copy elsewhere

**Binary manifest**:
The versioned list that tells Arroxy which managed binary build to fetch for the current platform.
_Avoid_: index, build list

**Managed binary**:
A dependency Arroxy downloads and caches itself, as opposed to one found already installed on the system. Release builds bundle no dependency; both the downloader and the media tools are managed.
_Avoid_: downloaded binary, fetched binary

**FFmpeg package**:
The one approved download that holds the media tools and every library they need, installed once per machine and kept across app updates until a different package is approved.
_Avoid_: FFmpeg bundle, FFmpeg zip, embedded FFmpeg

**Remux matrix**:
The check an FFmpeg build must pass before it is approved: every media tools command a download can run (merging, cutting a time range, embedding metadata, chapters, a thumbnail or subtitles), tried on small stand-ins for each kind of stream the video platform serves, in each file type that can hold them.
_Avoid_: ffmpeg test suite, codec matrix, smoke test

**Diagnostics file**:
The single file a user saves from Settings to attach to a bug report: a snapshot of the session context followed by the current and previous log, with user folder names and URL secrets removed.
_Avoid_: log bundle, crash report, support dump

**Warmup**:
The readiness check that verifies the dependencies are present and working — fetching any that are missing — and runs at startup and again on demand from the repair flow. The media dependencies (the downloader and the media tools) gate downloads; the token warm-up is best-effort and never blocks. Verification means actually running each dependency; a passing verdict is remembered for up to seven days, as long as the file it was checked against hasn't changed.
_Avoid_: bootstrap, init, preflight

**Quality limit**:
A download that finished below both the quality its profile asked for and 720p because the video platform withheld the higher formats for that session, rather than because the video lacks them.
_Avoid_: low quality, degraded download, SABR error

**Cookieless retry**:
Re-fetching a quality-limited download without the configured cookies, after the signed-in attempt is stopped as soon as formats are chosen. Its verdict (helps / does not help) is remembered for the rest of the app session.
_Avoid_: cookie fallback, signed-out mode

**Download smoke**:
A headless run of the real download path for one link that stops as soon as the downloader has chosen formats, reporting which formats were picked and why — used to compare cookie, proxy, profile, and player-client variations one at a time.
_Avoid_: dry run, format test, quality probe

### Explore

**Explore**:
The in-app browser tab where the user browses the web and may sign in to sites. It opens on YouTube, searches the web with the search engine the user picks (DuckDuckGo unless another is chosen), sits beside the **Wizard** as a second way to find a video, and a page or link opened there can be handed to a download.
_Avoid_: built-in browser, web view, browse tab

**Explore session**:
The persistent browsing identity behind Explore, owned by the app and kept separate from the user's own browser. Signing in to Explore signs in this identity; signing out of Explore clears it.
_Avoid_: Explore account, browser profile

**Idle unload**:
Releasing the Explore page once the user has been away from the tab for a while, to free its memory. Off unless the user turns it on: coming back costs a reload. Only pages a reload cannot cost anything are released (the site's home and search results); coming back reloads the page at the same place in its history, in the same **Explore session**.
_Avoid_: suspension, discard, hibernation, sleeping tab

**Explore cookies**:
The cookies read from the Explore session each time a download step needs them, used for that step and then discarded. A YouTube download gets YouTube's cookies only; a download from any other site gets every cookie but Google's and YouTube's account cookies.
_Avoid_: session cookies (that term already means cookies that expire when a browser closes), saved login

**Escalation**:
Switching one download from anonymous to the Explore session after a failure that an account can fix, such as a private, members-only, or age-restricted video, or a bot check.
_Avoid_: fallback, login retry, upgrade

**Job auth**:
The identity a job runs as: anonymous, or the Explore session after escalation. It is fixed for the rest of that job.
_Avoid_: login state, credentials

### Heartbeat

**Heartbeat**:
The one anonymous signal an install sends per day, unless turned off: app version, OS, language, install channel. It carries no identifier; the country is added where it is received. It only counts active installs, and is the only thing Arroxy reports.
_Avoid_: telemetry, analytics event, usage ping, tracking

### Appearance

**Style**:
The overall look of the app — how surfaces, edges and the background are painted. Aurora (glass over a moving sky) and Minimal (solid, quiet surfaces) are styles. Every style comes in both color schemes; switching style never moves anything or changes what the app does.
_Avoid_: theme, skin, look, visual mode

**Color scheme**:
Light, dark, or following the system. Chosen independently of the style.
_Avoid_: theme, mode, sky (sky is design-doc shorthand for one style in one scheme)

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
