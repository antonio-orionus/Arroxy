# Contributing to Arroxy

Thanks for thinking about contributing! Bug reports, fixes, and small features are all welcome.

This document covers the essentials. If anything is unclear, open an issue and ask.

---

### Branch policy

Arroxy uses a single long-lived branch, **`main`**. Open contributor PRs against `main`. Feature work happens on short-lived feature branches in your fork and merges into `main` when ready.

### Contributor flow

1. Fork the repo.
2. Create a feature branch in your fork.
3. Open a PR into `main`.
4. Wait for CI and maintainer review.

### Maintainer release flow

1. Contributor work lands on `main`.
2. Maintainers cut `vX.Y.Z-beta.N` tags from `main` for validation. Pre-release tags are auto-marked `prerelease: true` on GitHub and do not auto-update existing user installs.
3. After validation, bump `package.json` to the stable version on `main`.
4. Cut `vX.Y.Z` from `main`; stable package-manager publishing (Scoop, Homebrew, Winget) only happens for these stable tags.

### Registry package flows

`yt-dlp-bridge` and `ytdlp-errors` live under `packages/` and are published to npmjs.com from this repository. Package PRs use the same Arroxy CI gate as app PRs.

Maintainers publish `yt-dlp-bridge` by bumping `packages/yt-dlp-bridge/package.json`, merging to `main`, then pushing a tag named `yt-dlp-bridge-vX.Y.Z`.

Maintainers publish `ytdlp-errors` by bumping `packages/ytdlp-errors/package.json`, merging to `main`, then pushing a tag named `ytdlp-errors-vX.Y.Z`.

Both registry workflows build tarballs with Bun, then publish through registry trusted publishing. They do not use long-lived registry publish tokens.

## Reporting bugs / requesting features

Use the [issue templates](https://github.com/antonio-orionus/Arroxy/issues/new/choose). For bugs, include:

- OS + version (e.g. Windows 11 23H2, macOS 14.4, Ubuntu 24.04)
- Install channel (NSIS installer, Portable, Scoop, Homebrew, Winget, AppImage, tar.gz, Flatpak, DMG)
- Arroxy version (visible in the title bar / Settings)
- A URL or scenario that reproduces it, plus the failure mode (error text, log line, screenshot)

## Local development

Prerequisites: [Bun](https://bun.sh) and Node.js LTS. Linux additionally needs `bash` + `unzip` for the embedded-binary fetch.

```bash
git clone https://github.com/antonio-orionus/Arroxy.git
cd Arroxy
bun install
bun run dev          # runs the Electron app against the Vite renderer
```

For pure-renderer / UI work without the Electron shell:

```bash
bunx vite src/renderer --port 5173 --mode browser-mock
```

The renderer's `browserMock.ts` stubs `window.appApi` only in explicit `browser-mock` mode so the wizard, queue, and update banner all simulate without a backend. Electron dev and packaged builds use the real preload bridge.

## Required pre-PR checks

Run the full local gate before opening a PR. CI gates on the same checks.

```bash
bun run check       # format + lint + tooling contract + typecheck + knip + madge + LOC + pins + i18n + tests + package gates
```

The root-owned tooling contract is documented in [`dev-docs/tooling-contract.md`](dev-docs/tooling-contract.md). New workspace packages must be wired into that contract before merging.

## Building installers locally (optional)

```bash
bun run dist:linux   # AppImage + tar.gz + Flatpak inputs
bun run dist:mac     # arm64 + x64 DMG (requires macOS host)
bun run dist:win     # NSIS installer + Portable .exe (Windows host)
```

For a fresh-Windows-box bootstrap, see `scripts/build/build-windows.ps1`.

## Coding conventions

- **TypeScript-strict.** No `any` / `unknown` without justification.
- **Naming.** Reuse the domain glossary in [`CLAUDE.md`](CLAUDE.md) → "Domain Glossary" section (Job / ActiveJob / Phase / JobLifecycle / BinaryManager / NavContext / FormatPicker / etc.). Don't introduce parallel vocabularies.
- **Architecture.** Renderer should not know how main fetches; main should not know which component renders. IPC channel names live in `src/shared/ipc.ts`; payload types live in `src/shared/types.ts`.
- **Comments.** Don't restate what code already says. Comment when WHY is non-obvious — a hidden constraint, an OS-specific quirk, a workaround for a specific bug.
- **No backwards-compat shims.** Delete old code rather than aliasing or re-exporting.
- **Mature libraries over bespoke code** for validation, HTTP, ORM, auth, logging, etc.

## Commit & PR conventions

- **Conventional Commits.** Subject ≤ ~70 chars: `fix(scope): …`, `feat(scope): …`, `refactor: …`, `build: …`, `docs: …`. Body explains the _why_, not the _what_.
- **No AI attribution.** Do **not** add `Co-Authored-By: Claude …` trailers or `🤖 Generated with …` footers to commits or PR bodies. Write as if authored solely by yourself.
- **Small, separable commits.** If your PR has two unrelated concerns, make them two commits — reviewers may take one and not the other.
- **Sign your commits** if your Git identity is set up for it. Not required.

## Licensing

Arroxy is MIT-licensed. By submitting a PR you agree your contribution is licensed under the same terms.
