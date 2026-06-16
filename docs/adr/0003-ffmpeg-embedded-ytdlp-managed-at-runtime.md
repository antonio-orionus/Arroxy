# ffmpeg is embedded at build time; yt-dlp is managed at runtime

ffmpeg and ffprobe are bundled into the packaged app at build time, while yt-dlp
is fetched and updated at runtime rather than shipped with a release.

The split is driven by update cadence. ffmpeg's codec behavior is stable, so
pinning a known-good build at release time removes a class of version-mismatch
bugs. yt-dlp, by contrast, ships fixes on roughly the same weekly cycle as
YouTube's bot-protection changes — bundling it would mean publishing a full app
release every time a download breaks, which is untenable. Managing it at runtime
lets downloads keep working between app releases.

## Consequences

The app must treat yt-dlp as an external dependency it resolves, verifies, and
caches itself, with a bundled fallback. This is the reason a startup readiness
check (warmup) exists at all.
