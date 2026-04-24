# YT Download UI

Production-oriented Electron desktop app for YouTube downloads with a layered TypeScript architecture.

## Stack

- Electron + `electron-vite`
- React + TypeScript (strict)
- Typed IPC with Zod validation
- Zustand state store in renderer
- Vitest + Playwright (Electron)

## Architecture

- `src/main`: desktop backend (services, stores, IPC)
- `src/preload`: secure bridge (`window.appApi`)
- `src/renderer`: React UI
- `src/shared`: contracts, schemas, and shared types

Core backend modules:

- `DownloadService`: single active job lifecycle
- `FormatProbeService`: format probing via `yt-dlp`
- `TokenService`: PO token orchestration
- `BinaryManager`: runtime binary acquisition + checksum flow
- `SettingsStore` / `RecentJobsStore`: persistence
- `LogService`: local structured logs

## Development

```bash
npm install
npm run dev
```

## Quality Gates

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

## Notes

- `yt-dlp` and `ffmpeg` are runtime-managed in app data cache.
- Telemetry is local-only (logs directory under Electron `userData`).
- For e2e reliability, tests launch with a mock backend (`MOCK_BACKEND=1`).
