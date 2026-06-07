# Download Profiles Spec

Status: concise draft for UI mock review
Updated: 2026-06-07

## Goal

Add persistent **Download Profiles**: saved download configurations that work for single videos, bulk URL lists, and playlists.

Use **Download Profile** for the new saved object. Keep **Preset** for the existing low-level quality preset enum and playlist quality helpers.

## Scope

- Profiles are universal: single URL, bulk URLs, and playlist/channel/search URLs.
- Bulk Quick Download queues all accepted URLs. No item selection.
- Playlist Quick Download queues all loaded playlist entries. No item selection.
- If playlist entries exceed the current probe limit, show a dialog:
  - accept the currently loaded items,
  - or change probe limit and re-probe.
- Interactive/manual download keeps selection steps for users who want to choose items/formats.

## Main Screen

Redesign the first screen around one single-URL input and three actions:

- **Quick Download split button**: runs with the Active Profile.
  - Button label shows profile name, e.g. `[Download icon] Podcast MP3`.
  - Chevron opens profile picker/manage menu.
- **Interactive Download**: current wizard/manual flow. This replaces `Fetch formats`.
- **Bulk URLs**: keep the existing bulk dialog UI because it is useful for pasting and editing many links.

Clipboard behavior:

- If clipboard watching is enabled, auto-fill one detected URL into the input and show a toast.
- If several URLs are detected, fill the first URL only, remember the full list for **Bulk URLs**, and show a toast.
- Remove the clipboard confirmation dialog.
- If clipboard watching is disabled, user pastes manually.

## Bulk URLs Dialog

Keep the current dialog concept and UI.

Purpose:

- Paste many links.
- Edit the list inside Arroxy.
- Clean duplicates/rejected lines.
- Avoid external notes/tables.

Behavior:

- Confirmed accepted URLs become the bulk download input.
- Quick Download applies the Active Profile to every accepted URL.
- Interactive Download opens the existing bulk/manual selection flow.

## Download Profile Shape

Conceptual type:

```ts
type DownloadProfileMedia =
  | {
      kind: 'video-audio' | 'video-only';
      codec: 'best' | 'mp4';
      tiers: PlaylistVideoTier[];
      audio?: { format: PlaylistAudioFormat; bitrateKbps?: AudioBitrate };
    }
  | { kind: 'audio-only'; audio: { format: PlaylistAudioFormat; bitrateKbps?: AudioBitrate } }
  | { kind: 'subtitles-only' };

interface DownloadProfile {
  id: string;
  name: string;
  media: DownloadProfileMedia;
  subtitles: {
    languages: string[];
    mode: SubtitleMode;
    format: SubtitleFormat;
  };
  output: { kind: 'default' } | { kind: 'fixed'; dir: string };
  subfolder: { enabled: boolean; name: string };
  sponsorBlock: { mode: SponsorBlockMode; categories: SponsorBlockCategory[] };
  embed: {
    chapters: boolean;
    metadata: boolean;
    thumbnail: boolean;
    description: boolean;
    thumbnailSidecar: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
```

Persist in settings as a new `profiles` bucket:

```ts
interface DownloadProfilesPrefs {
  active: { kind: 'builtin'; id: string } | { kind: 'custom'; id: string };
  custom: DownloadProfile[];
}
```

Schemas go in `src/shared/schemas.ts`.

## Media Resolver

Profiles must not store concrete `formatId`s. They vary per URL.

Reuse/extract the playlist range logic:

- `playlistPresetSpec()` -> `mediaIntentSpec()`.
- Consider renaming `PreparedJob.kind === 'playlist-preset'` to a neutral name like `ranged-format`.
- Keep graceful selectors: best, height cap, MP4 best-effort, audio best, audio conversion.

## Profile Editor

One form, not a wizard.

Fields:

- Name.
- Mode: video + audio, video without audio, audio-only, subtitles-only.
- Video codec: best codec or MP4/H.264 best-effort.
- Video quality targets: best, 4K, 1440p, 1080p, 720p, 480p, 360p. Multiple targets can be saved.
- Audio: best, MP3, M4A, Opus; bitrate 128/192/256/320.
- Subtitles: language codes, mode, format.
- Destination: default folder or fixed folder; optional subfolder.
- Output artifacts: chapters, metadata, thumbnail, description, thumbnail sidecar.
- SponsorBlock: off, mark, remove, categories.

## Mock First

Before backend work, build browser-mock UI scenarios:

- Main screen with active profile split button.
- Profile picker/menu.
- Profile create/edit form.
- Bulk URLs dialog with profile-aware entry path.
- Clipboard auto-fill toast.
- Playlist probe-limit dialog.

Visual review gates:

- Split button clearly shows active profile.
- Bulk dialog stays useful for editing many links.
- Minimum window size has no overlapping text.
- Dark/light themes are acceptable.

## Implementation Order

1. Browser-mock UI only.
2. Profile schemas/settings persistence.
3. Shared media resolver extraction.
4. Quick Download integration for single, bulk, playlist.
5. Tests and `bun run check`.

## Open Decisions

- Confirm the name **Download Profile**.
- Confirm `Interactive Download` vs another label for manual wizard flow.
- Decide whether clipboard auto-fill replaces or appends when input already has content.
