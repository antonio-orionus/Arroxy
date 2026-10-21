# Tooling Contract

Arroxy uses one root-owned monorepo tooling contract built on [Vite+](https://viteplus.dev): the `vp` CLI bundles Vite, Vitest, Oxlint, Oxfmt, tsdown and the Vite Task runner, all configured from the root `vite.config.ts`. Package-local configuration is allowed only when a package needs its own build, test, or registry publish surface.

Vite+ docs for the installed version live at `node_modules/vite-plus/docs`; `bunx vp toolchain` prints the exact version of every bundled tool. Vite+ does not drive the Electron build: electron-vite (`electron.vite.config.ts`) owns dev and build and runs on the `vite` that Vite+ provides, and electron-builder owns packaging.

## Authorities

| Concern | Tool | Contract |
| --- | --- | --- |
| Formatting | Oxfmt (`vp fmt`) | Root `vite.config.ts` `fmt` block. Its `ignorePatterns` keep prose, generated files, `*.json5` and `skills-lock.json` out of scope. |
| Static checks | `vp check` | One pass: Oxfmt, Oxlint and type errors. `check:static` builds `ytdlp-errors` first, because type-aware rules read its built types. |
| Linting | Oxlint (`vp lint`) | Root `vite.config.ts` `lint` block is the only lint config. `import/no-cycle` (with `ignoreTypes: false`, so type-only cycles count) covers `src/` and every package `src/`, resolving tsconfig path aliases. |
| Types | `vp check` (`typeCheck: true`) | Type checking runs inside lint through the TypeScript 7 toolchain (tsgolint); `build` type-checks with `vp check --no-fmt --no-lint`. Publishable packages still run `tsc` in their own `typecheck` and `build` scripts. |
| Tests | Vitest (`vp test`) | Root `vite.config.ts` `test` block defines the `node` and `jsdom` projects; each package's `vite.config.ts` holds its own `test` block. Tests import from `vite-plus/test`. |
| Library builds | tsdown (`vp pack`) | `ytdlp-errors` builds from its `vite.config.ts` `pack` block with `fixedExtension: false`, so output names match `package.json` `exports`. |
| Task running | Vite Task (`vp run`) | `bun run check` runs the `quality-gate` task: every gate in parallel, then `packages:check`. The task is uncached on purpose. |
| Commit hooks | `vp config` / `vp staged` | `.vite-hooks/pre-commit` runs `vp staged` (rules in the `vite.config.ts` `staged` block), then the commit-fallout check. `.vite-hooks/pre-push` runs the revert check. |
| Unused code | Knip | Every workspace package must be represented in `knip.json`. |
| Registry package safety | Package gates | Root `packages:check` owns dependency order and runs package typecheck, test, build, pack dry-run, and packed metadata verification. |

## Root Commands

```bash
bunx vp check                   # format + lint + type errors + import cycles
bunx vp check --fix             # same, with formatter and lint fixes
bun run check:static            # errors:build + vp check (the gate's static step)
bun run check:tooling-parity    # representative rule parity probes
bun run check:tooling-contract  # verifies this monorepo tooling contract
bun run check:selection-parity  # Format-screen picks vs real yt-dlp (needs Python 3.10+)
bun run check:filename-parity   # predicted download paths vs real yt-dlp (needs Python 3.10+)
bun run packages:check          # registry package gates in dependency order
bun run check                   # canonical local and CI gate
```

`bun run check` is the single required pre-PR and CI command. CI should call it directly instead of duplicating its substeps.

The two parity checks run the pinned yt-dlp zipapp (fetched once into `node_modules/.cache`, SHA-256 verified) under Python 3.10+. `check:filename-parity` takes about 15 s. Without Python 3.10+, or offline with no cached zipapp, it prints `SKIPPED` and exits 0 locally so a missing runtime does not block a contributor, and it never prints a pass. When `CI` is set the same gap fails the run, so the gate that enforces it cannot skip it. Every path change is compared with yt-dlp's own expansion of `$VAR`, `~`, `%VAR%` and `%(field)s` there; a unit test alone does not prove that. It also downloads a few streams that it serves itself on 127.0.0.1, and checks that every file yt-dlp writes on the way (`.f<format_id>`, `.part`, fragments) fits the reserve the name was budgeted with.

## Pre-commit Hook

`.vite-hooks/pre-commit` runs two steps:

1. `vp staged` formats and lints the **staged** files. Code files go through `vp fmt`, then `vp lint --fix --deny-warnings`. That is `vp check` plus a warning gate, because `vp check` exits 0 on warnings and cannot take `--deny-warnings`.
2. `scripts/check-commit-fallout.ts` runs when TypeScript is staged. It runs one whole-repo `vp lint --type-aware`, which also reports type errors (about 4 s), and blocks on findings in files the commit fully determines. Step 1 alone misses a change's fallout in files it doesn't touch. For example, narrowing a constructor parameter type makes `as never` casts in untouched tests redundant, and type-aware lint rejects them.

`bun install` runs `vp config --no-agent`, which installs the hook dispatcher under `.vite-hooks/_`. It leaves an existing `core.hooksPath` alone, so a clone that used husky before keeps pointing at the dead `.husky/_` and runs no hooks. Run `bunx vp hooks enable` once in such a clone. `core.hooksPath` is shared by every worktree of a clone.

A file with unstaged or untracked changes holds work outside the commit, possibly a parallel agent's. Its findings are reported but never block. `git commit --no-verify` bypasses both steps; `bun run check` still gates the PR.

## Pre-push Hook

`.vite-hooks/pre-push` runs `scripts/check-push.ts` on every branch push except to `main`, which takes docs-only commits directly. It fetches `origin main` and refuses a push that wholly undoes recent main commits, meaning every file such a commit changed is back to an earlier version byte-for-byte. That is what squashing with `git reset --soft origin/main` after main moved produces. The re-parented stale index reads as a revert of everything merged since. A diff comparison of `origin/main` with `origin/main...HEAD` cannot see it, because the merge-base is then main itself. A commit undone only by deleting its files does not count, since that is also how files are retired.

A deliberate revert passes with `ARROXY_ALLOW_REVERT=1 git push`. The land flow runs the same check through `bun run review:check-head`, which also refuses a head whose diff differs from the one `review:dual` last reviewed. That gate stays out of the hook, so a plain push by hand never needs a review.

Publish workflows stay package-specific, but they call root package check scripts: `bun run errors:check` for `ytdlp-errors`, `bun run bridge:check` for `yt-dlp-bridge` and `bun run control:check` for `arroxy-control`.

Package release workflows use `bun pm pack` to build tarballs, then publish those tarballs through registry trusted publishing with the Node registry CLI. GitHub artifact attestation still covers generated tarballs; registry provenance is generated by trusted publishing.

## Workspace Package Rules

- Add every workspace package to Knip workspaces and to the `import/no-cycle` lint override when it has source, and never exclude it in the `fmt` block's `ignorePatterns`.
- Publishable packages must expose `typecheck`, `test`, `build`, `prepack`, and `pack:dry-run`.
- Publishable packages use `bun pm pack --dry-run` for local pack checks.
- Publishable package-to-package runtime dependencies may use `workspace:*` only when the dependency name is another local workspace package.
- Packed package metadata must not contain `workspace:`; `scripts/check-package-publish-metadata.mjs` verifies Bun rewrites internal `workspace:*` dependencies to the exact local package version.
- Publish a dependency before the package that depends on it. Packing pins `yt-dlp-bridge` to the local `ytdlp-errors` version, so after a `ytdlp-errors` bump its tag must publish first. The bridge publish workflow runs `scripts/check-packed-dependencies.ts` on the packed tarball and fails with "publish ytdlp-errors X first" while the registry lacks that version.
- The root app is private and may use `workspace:*` for local package development.
- Keep package-local `vite.config.ts` files for package `test` and `pack` blocks only. They must not define `fmt`, `lint` or `staged`; Vite+ ignores nested format and lint configs. Do not add package-local Oxlint, Oxfmt, ESLint, Biome, or Prettier configs.
- Do not reintroduce a tool Vite+ already provides (Biome, `oxfmt`, husky, lint-staged, concurrently, tsup, tsdown). `check:tooling-contract` rejects them.
- `oxlint` and `oxlint-tsgolint` stay as root dev dependencies pinned to the exact versions `vite-plus` bundles. `vp` resolves both from the working directory first, and Node's lookup climbs into parent directories. Without the pins, a worktree nested inside another checkout (`.worktrees/…`) lints with that checkout's copy. Never run them directly; use `vp lint` / `vp check`.

## Oxlint Bridge Policy

`eslint-plugin-react-hooks`, `eslint-plugin-security`, and `eslint-plugin-react` remain dev dependencies because Oxlint loads them through its JS-plugin bridge for parity-critical rules. Removing them requires native Oxlint parity or a documented replacement scanner.

`scripts/check-tooling-parity.mjs` protects this bridge by proving representative React hooks/compiler, security, React, and type-aware TypeScript diagnostics still fire.

## Vendored anti-slop plugin

`tools/oxlint/anti-slop/` is root-owned lint infrastructure, not a workspace package or a package-local lint configuration. It is vendored because upstream publishes no official registry package and explicitly documents vendoring as its distribution model. `PROVENANCE.md` records the upstream repository, commit, version, license, and local modification policy; `LICENSE` preserves the upstream MIT text.

The root config adopts exactly these six rules as errors:

- `anti-slop/no-widen-then-assert`
- `anti-slop/no-unknown-type-aliases`
- `anti-slop/no-reflect-apply`
- `anti-slop/no-reflect-get`
- `anti-slop/no-object-parameters`
- `anti-slop/no-chained-type-assertions` (off only for test globs)

`no-unknown-parameters` and `no-runtime-typeof` are intentionally rejected because they conflict with Arroxy's trust-transition parsing and valid typed-union/capability narrowing. `no-unsafe-dictionary-type`, `no-known-value-widening`, and `no-unknown-returns` are audit-only. The remaining upstream rules are rejected or deferred; none is hidden behind a broad directory override.

Root `@oxlint/plugins`, `oxlint` and `oxlint-tsgolint` must stay pinned to the exact versions the installed `vite-plus` bundles; bump them in the same commit as `vite-plus` (`bunx vp toolchain` lists the versions). `check:tooling-contract` enforces the alignment, while `check:tooling-parity` runs single-file fixtures that prove all six rules execute, accepted syntax remains accepted, and the test override disables only chained assertions. When an Oxlint upgrade is incompatible, remove the anti-slop registration and dependency rather than pinning Vite+ back solely for the plugin. The vendored plugin keeps importing `@oxlint/plugins`; `vp migrate` rewrites those imports to `vite-plus/lint/plugins`, which resolves an older bundled copy, so revert that rewrite under `tools/` after any migrate run.

Audit-only rules may be run manually during a focused refactor, but they are not CI policies or numeric ratchets. New broad rule overrides require architectural justification; file-path membership alone is not a trust-boundary justification.
