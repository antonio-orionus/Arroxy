# Startup verification

| Lives in                                    |                                                                                                                       |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Journey catalog (data)                      | `scripts/startup/journeys.ts`                                                                                         |
| Runner / oracle / provisioner / verdicts    | `scripts/startup/runJourney.ts`, `logOracle.ts`, `provisionProfile.ts`, `checkVerdicts.ts`, `fetchPreviousRelease.ts` |
| Entry point (Playwright Test spec)          | `tests/e2e/startup-journeys.spec.ts`                                                                                  |
| Workflows                                   | `e2e-cold-start.yml` (pr), `release.yml` `startup-gate` (release), `startup-nightly.yml` (nightly)                    |
| Design spec + plan (local-only, gitignored) | `docs/superpowers/specs+plans/2026-08-30-startup-verification-ci*`                                                    |
| Decision records                            | `docs/adr/0006` · map: `dev-docs/ci-cd-strategy.md`                                                                   |

## Current state (2026-08-30)

| Tier                                         | Status                                                                        |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| `pr` (Linux, blocking via branch protection) | ✅ green in CI, verified against a real packaged build                        |
| `release` (all 3 platforms, on tags)         | ⚠️ advisory — not wired into `prepare-release` yet; never fired (needs a tag) |
| `nightly` (all 3 platforms, scheduled)       | ❌ first run red — two structural defects, see below                          |

Invocation: `ARROXY_STARTUP_TIER=<tier> PACKAGED_EXE=<exe> bun run verify:startup`.

## Decisions and why

1. **Journeys are data; one executor.** The replaced per-workflow bash launch scripts rotted independently — that is exactly how the cold-start check became a silent no-op for two months. One executor cannot rot on one platform while passing on another.
2. **Verdict accounting is the pass signal, not exit codes.** A missing verdict is a failure, so "ran nothing" and "passed" can never produce the same result. Confirmed on its first nightly run: the defect below surfaced as loud red, not a fake pass.
3. **A pure log oracle over `main.log`.** UI milestones alone cannot see silent fallbacks, swallowed exceptions, or unsettled warmup branches; the logs are already captured as CI artifacts, so asserting on them is close to free.
4. **PR gate is Linux-only.** Runner economics; multi-platform startup confidence belongs at tag time. Full trade-off and the incident behind it: ADR 0006.
5. **Release gate runs advisory until soaked.** A flaky gate blocking every release is worse than the gap it replaces. Wire `startup-gate` into `prepare-release` after ~a week of green tag runs — calendar it, do not wait to remember.
6. **Entry point is a Playwright Test spec, not a bare CLI script.** `_electron.launch()` hangs indefinitely under Bun; every working Electron launch in the repo rides the Playwright CLI, which `bunx` resolves through its `#!/usr/bin/env node` shebang into real Node. The tier rides in `ARROXY_STARTUP_TIER` because a spec takes no CLI args.
7. **Degraded journeys run nightly, non-blocking.** Forced offline, software rendering, and PATH poisoning are inherently flaky to stage; gating every PR on them would make the gate flaky. Non-blocking still catches drift within a day.
8. **Profile copies preserve mtime and drop copied logs.** `ProbeVerdictCache` keys on mtime, so `cp -R` silently invalidates the cache under test; a copied `main.log` would let a stale "Warmup completed" satisfy the oracle for the wrong session.
9. **`ARROXY_E2E` / `MOCK_BACKEND` are stripped from journey env.** Those flags swap in mock providers and would mock away the exact branches the journeys exist to verify.

## Known defects (open)

1. **Nightly warm journeys can never pass.** The nightly tier has no `fresh-cold`, so no journey seeds the warm source; `index-off`, `no-gpu`, `contaminated-path` fail with "no warm source". Fix: add `fresh-cold` to the nightly tier (or generate the warm profile in a setup phase).
2. **`offline-no-cache` cannot pass online.** It expects `repair-panel`, but `network: 'offline'` is declared data nothing enforces — observed `main-screen` on the first run. Fix: enforce via deny proxy or netns, or descope the journey.
3. **Wire `startup-gate` into `prepare-release`** after the soak (see decision 5). Until then a broken macOS cold start can ship.
4. **Nightly red = same-day look.** A non-blocking job nobody reads is the silent gap reborn.

## Incidents

- 2026-06 → 2026-08: fake-`node` PATH leak made macOS/Linux cold start report green without launching Electron. Fixed structurally by decisions 1–2.
- 2026-08-30: stale required contexts (`Cold start (windows)` / `(macos-arm64)`) blocked every PR with phantom pending after the tier went Linux-only. Fixed; contract in `ci-cd-strategy.md`.
