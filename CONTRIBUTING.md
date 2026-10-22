# Contributing to Arroxy

Thanks for thinking about contributing! Bug reports, fixes, and small features are all welcome.

This document covers the essentials. If anything is unclear, open an issue and ask.

---

### Branch policy

Arroxy uses a single long-lived branch, **`main`**. Open contributor PRs against `main`. Feature work happens on short-lived feature branches in your fork and merges into `main` when ready.

### Contributor flow

1. Fork the repo.
2. Create a feature branch in your fork.
3. Change English copy only: `src/shared/i18n/locales/en.json` and `readme-src/locales/en.mjs`. Every other locale is translated in one sync PR at release time ([ADR 0017](docs/adr/0017-prs-change-english-only.md)).
4. Open a PR into `main`.
5. Wait for CI and maintainer review.

### Maintainer release flow

Releases are cut straight from `main`: the translation sync PR, then the version bump and the assembled changelog, then the tag.
The steps, the optional beta path and the manual fallback are in [`dev-docs/release-runbook.md`](dev-docs/release-runbook.md).

### Registry package flows

`yt-dlp-bridge` and `ytdlp-errors` live under `packages/` and are published to npmjs.com from this repository. Package PRs use the same Arroxy CI gate as app PRs.

Maintainers publish `yt-dlp-bridge` by bumping `packages/yt-dlp-bridge/package.json`, merging to `main`, then pushing a tag named `yt-dlp-bridge-vX.Y.Z`.

Maintainers publish `ytdlp-errors` by bumping `packages/ytdlp-errors/package.json`, merging to `main`, then pushing a tag named `ytdlp-errors-vX.Y.Z`.

`arroxy-control` (the Control API schemas) and `arroxy-mcp` (the MCP bridge and command line) are private and never published; they stay in this repo as workspace packages. Each publish workflow (`.github/workflows/publish-*.yml`) can also run by manual `workflow_dispatch`. Pushing to `main` publishes nothing.

A package's changelog (`packages/ytdlp-errors/CHANGELOG.md`, the "What changed in X" sections of `packages/yt-dlp-bridge/README.md`) is written only by its `release(packages): <pkg> <version>` PR, from the commits since the last tag; feature PRs leave it alone.

Both registry workflows build tarballs with Bun, then publish through registry trusted publishing. They do not use long-lived registry publish tokens.

## Reporting bugs / requesting features

Use the [issue templates](https://github.com/antonio-orionus/Arroxy/issues/new/choose). For bugs, include:

- OS + version (e.g. Windows 11 23H2, macOS 14.4, Ubuntu 24.04)
- Install channel (NSIS installer, Portable, Scoop, Homebrew, Winget, AppImage, tar.gz, Flatpak, DMG)
- Arroxy version (visible in the title bar / Settings)
- A URL or scenario that reproduces it, plus the failure mode (error text, log line, screenshot)

Maintainers file the bugs, test gaps and code-health items they find as issues too. The `issue-policy` workflow (`scripts/issuePolicy.ts`) asks each of those for one kind label (`bug`, `enhancement`, `tests`, `tech-debt`, `i18n` or `documentation`), one state label while it's open (`ready-for-agent`, `ready-for-human`, `parked` or `question`) and, for the first three kinds, a `path/to/file.ts:123` reference; an issue that misses one gets the `needs-triage` label until it's fixed. Labels and what gets an issue: [`docs/agents/`](docs/agents/issue-tracker.md). A PR that fixes an issue closes it with a `Fixes #N` line.

## Local development

Recommended prerequisites: [mise](https://mise.jdx.dev), plus the native OS packages listed below. The shared `mise.toml` pins Node.js and Bun for this repo.

If you do not use mise, install Node.js from `.node-version` and Bun from the root `package.json` `packageManager` field. Bun must already be available before `bun run bootstrap`; bootstrap repairs project-local dependencies and managed binaries, but it does not install Bun itself.

Bun installs JavaScript dependencies, but it does not replace native OS prerequisites.

- macOS: Xcode Command Line Tools may be needed for native rebuilds.
- Windows: Visual Studio Build Tools and Python may be needed for native rebuilds.
- Linux: Electron GUI libraries, compiler toolchain, Python, `tar`, and Playwright browser dependencies may be needed.

Run `bun run doctor` after setup. It reports the specific missing tool or artifact when possible.

### Quick start on macOS

```bash
brew install mise
xcode-select --install

git clone https://github.com/antonio-orionus/Arroxy.git
cd Arroxy
mise trust
mise install
bun run bootstrap
bun run doctor
bun run dev          # runs the Electron app against the Vite renderer
```

Make mise active in new zsh tabs so the repo-pinned Node.js and Bun versions win over global installs:

```bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
```

If `bun run doctor` reports a newer Node.js from `fnm` or a newer Bun from Homebrew, mise is installed but not active for the shell. Confirm from the repo root:

```bash
which node
which bun
node --version       # expected: v24.21.0
bun --version        # expected: 1.4.2
```

As a one-off workaround before fixing shell activation, run commands through mise:

```bash
mise exec -- bun run doctor
mise exec -- bun run dev
```

### Cross-platform quick start

```bash
git clone https://github.com/antonio-orionus/Arroxy.git
cd Arroxy
mise trust
mise install
bun run bootstrap
bun run doctor
bun run dev          # runs the Electron app against the Vite renderer
```

Without mise, manually activate the versions from `.node-version` and `package.json`, then run `bun run bootstrap`, `bun run doctor`, and `bun run dev`.

For pure-renderer / UI work without the Electron shell:

```bash
bun run dev:mock
```

The renderer's `browserMock.ts` stubs `window.appApi` only in explicit `browser-mock` mode so the wizard, queue, and update banner all simulate without a backend. Electron dev and packaged builds use the real preload bridge.

Other dev starts and fixes:

```bash
bun run dev:fresh   # clear main.log then start (cross-platform)
bun run dev:anon    # own profile (<userData>-anon): Explore signed out every launch, no first-run gates, no cookies
bun run repair      # non-destructive fix for missing or stale dependencies, Electron payloads, Playwright browsers, embedded ffmpeg/ffprobe
```

If you use git worktrees, create them with your own tool or harness, then run `bun run bootstrap` inside the new worktree.

Playwright browser downloads use Playwright's normal user cache by default. If you need a strictly repo-local browser cache for a throwaway checkout, run commands with `PLAYWRIGHT_BROWSERS_PATH="$PWD/.playwright-browsers"`; that local cache path is ignored by Git.

## Required pre-PR checks

Run the full local gate before opening a PR. CI gates on the same checks.

```bash
bun run check       # vp check (format + lint + types + import cycles) + tests + knip + tooling contract + LOC + pins + i18n + package gates
```

While iterating, `bunx vp check --fix` runs the static part in about five seconds.

The root-owned tooling contract is documented in [`dev-docs/tooling-contract.md`](dev-docs/tooling-contract.md). New workspace packages must be wired into that contract before merging.

## Building installers locally (optional)

```bash
bun run dist:linux   # AppImage + tar.gz + Flatpak inputs
bun run dist:mac     # arm64 + x64 DMG (requires macOS host)
bun run dist:win     # NSIS installer + Portable .exe (Windows host)
```

For a fresh-Windows-box bootstrap, see `scripts/build/build-windows.ps1`.

## Coding conventions

- **TypeScript-strict.** No `any`. Data from outside the process (IPC, files, child processes, the network) enters as `unknown` and is parsed into a named type before anything uses it.
- **Naming.** Reuse the domain glossary in [`GLOSSARY.md`](GLOSSARY.md). Don't introduce parallel vocabularies.
- **Architecture.** Renderer should not know how main fetches; main should not know which component renders. IPC channel names live in `src/shared/ipc.ts`; payload types live in `src/shared/types.ts`.
- **Comments.** Don't restate what code already says. Comment when WHY is non-obvious — a hidden constraint, an OS-specific quirk, a workaround for a specific bug.
- **No backwards-compat shims.** Delete old code rather than aliasing or re-exporting.
- **Mature libraries over bespoke code** for validation, HTTP, ORM, auth, logging, etc.

## Commit & PR conventions

- **Conventional Commits.** Subject ≤ ~70 chars: `fix(scope): …`, `feat(scope): …`, `refactor: …`, `build: …`, `docs: …`. Body explains the _why_, not the _what_.
- **No AI attribution.** Do **not** add `Co-Authored-By: Claude …` trailers or `🤖 Generated with …` footers to commits or PR bodies. Write as if authored solely by yourself.
- **A changelog fragment, not a `CHANGELOG.md` edit.** A user-facing change adds one `changelog.d/<slug>.<kind>.md` file ([`changelog.d/README.md`](changelog.d/README.md)); the release assembles them.
- **One concern per PR.** Two unrelated changes are two PRs, each passing `bun run check` on its own; a package change goes apart from the app change that uses it.
- **Sign your commits** if your Git identity is set up for it. Not required.

### PR policy

The `pr-policy` check (`.github/workflows/pr-policy.yml`) reads each PR's own diff, its commits and its title and body, and fails a PR that breaks one of the rules below. A PR that is a genuine exception says so with one line of its own in the PR body, `<key>: <reason>`, and the check passes with the reason noted. Editing the body re-runs the check. Lines inside HTML comments do not count.

| Rule | Fails when | Opt-out line |
| --- | --- | --- |
| Changelog fragment | A `fix` or `feat` PR (by its Conventional Commits title) changes `src/` and adds or edits no `changelog.d/` fragment | `No changelog: <reason>` |
| Released changelog | A section of `CHANGELOG.md` that is already released gains entries (rewording one stays allowed) | `Released changelog edit: <reason>` |
| English only | A translation changes: `i18n/`, a non-English locale under `src/shared/i18n/locales/` or `readme-src/locales/`, `readme-src/translated-from.json`, or `docs/readme/` without an English README source change. The `i18n: sync translations` PR is exempt and must pass `bun run check:i18n:complete` instead | `Translation change: <reason>` |
| Package scope | The PR changes both `packages/` and `src/` | `Package and app together: <reason>` |
| Package changelog | The PR edits `packages/<pkg>/CHANGELOG.md` or a "What changed in X" section of `packages/<pkg>/README.md`. The `release(packages): <pkg> <version>` PR is exempt for the packages its title names: it writes their sections from the commits since each last tag | `Package changelog edit: <reason>` |
| Base branch | The PR targets a branch other than `main` | `Stacked PR: <reason>` |
| No AI attribution | A commit message or the PR body credits an AI as a co-author or generator | `Attribution false positive: <reason>` (the body only; reword a commit instead) |

Typical exceptions: a feature behind a release flag (`No changelog: behind the <flag> release flag`), or a package change the app cannot build without (`Package and app together: <why neither is green alone>`).

## Licensing

Arroxy is licensed under the GNU General Public License v3.0 or later (see [`LICENSE`](LICENSE)). By submitting a PR you agree your contribution is licensed under the same terms. The `yt-dlp-bridge` and `ytdlp-errors` packages stay MIT; a contribution to one of them is MIT-licensed. The Arroxy name and logo are covered by [`TRADEMARKS.md`](TRADEMARKS.md).
