# Binary distribution

How Arroxy gets ffmpeg/ffprobe and yt-dlp, and keeps them licensed and verified. Both are managed at runtime: release builds bundle neither. yt-dlp's manifest is in [`runtime-binaries.md`](runtime-binaries.md); FFmpeg packages, their approval and publishing are in [`ffmpeg-packages.md`](ffmpeg-packages.md). The decisions are ADR 0003 (yt-dlp) and ADR 0010 (FFmpeg).

## Strategy

| Binary | Strategy | Source | Why |
| --- | --- | --- | --- |
| ffmpeg + ffprobe | **Managed package**, installed once per machine and kept across app updates | Our `arroxy-runtime-binaries` releases, built from BtbN GPL (Win/Linux) and Martin Riedl GPL (macOS) | 28% smaller Windows download; changes only through a reviewed pin |
| yt-dlp | Runtime-fetched and updated | GitHub `yt-dlp/yt-dlp(-nightly-builds)`, SourceForge mirror | Ships fixes about weekly with YouTube's bot-protection cycle |

**Electron as Node.** `electron-builder.json5` keeps the `runAsNode` fuse enabled because the packaged Electron executable is yt-dlp's Node runtime. `ELECTRON_RUN_AS_NODE=1` goes only into the yt-dlp child-process environment, never `process.env` or persisted config. Packaged runtime smoke tests assert the fuse, Node >=22, child-env isolation, managed yt-dlp selection and bundled EJS availability.

| Lives in | What |
| --- | --- |
| `scripts/build/fetch-embedded.sh` | Fetch, verify and extract upstream ffmpeg/ffprobe per platform (dev copies and package inputs) |
| `scripts/build/ffmpegPackage.ts` | Build an FFmpeg package; install a pinned one |
| `src/main/services/binary/FfmpegPackagePins.ts` | The approved packages |
| `scripts/test-binaries/` | Upstream-source smoke scripts (must stay tracked) |

## Development copies

- `scripts/build/fetch-embedded.sh <platform> <arch>` fetches, verifies the SHA-256 and extracts ffmpeg+ffprobe (and Linux `libav*.so*` siblings) into `build/embedded/<platform>-<arch>/`. `bun run bootstrap` runs it for the host.
- In an unpackaged build (`bun run dev`, the fixture E2E suites) `BinaryManager` uses those copies, so development never downloads a package. Release builds ignore them.
- Linux only: BtbN's shared build expects `libav*.so.*` siblings; `spawnYtDlp`, `spawnFFmpeg` and `probeBinary` set `LD_LIBRARY_PATH` to the ffmpeg directory at spawn time, which is the package directory in release builds. No rpath patching.

## License attribution

`THIRD_PARTY_NOTICES.txt` ships at `<resources>/` via top-level `extraResources` and covers yt-dlp (Unlicense) and the ad blocker libraries; it points to the FFmpeg package for FFmpeg. Each package carries its own `NOTICE.txt` (GPLv3), and its release must carry the corresponding source; see [`ffmpeg-packages.md`](ffmpeg-packages.md#redistribution). Arroxy stays MIT — spawn ≠ link, no GPL propagation into our code.

## Smoke parity

`scripts/test-binaries/smoke-all.sh` validates upstream binary source availability for runtime manifest automation and the upstream FFmpeg fetches. Run it before bumping fetch-embedded.sh asset names, the FFmpeg pins or runtime manifest source facts. **`scripts/test-binaries/` directory must stay tracked** — an earlier `.gitignore` rule `test-binaries/` accidentally matched it. Now anchored: `**/build/embedded/` (build output) and `/test-binaries/` (smoke output, root only).
