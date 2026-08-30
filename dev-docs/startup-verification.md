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
| `nightly` (all 3 platforms, scheduled)       | ✅ green — 5/5 verdicts on all three platforms ([run 33309036291](https://github.com/antonio-orionus/Arroxy/actions/runs/33309036291)) |

Invocation: `ARROXY_STARTUP_TIER=<tier> PACKAGED_EXE=<exe> bun run verify:startup`.

## Decisions and why

1. **Journeys are data; one executor.** The replaced per-workflow bash launch scripts rotted independently — that is exactly how the cold-start check became a silent no-op for two months. One executor cannot rot on one platform while passing on another.
2. **Verdict accounting is the pass signal, not exit codes.** A missing verdict is a failure, so "ran nothing" and "passed" can never produce the same result. Confirmed on its first nightly run: the no-warm-source defect surfaced as loud red, not a fake pass.
3. **A pure log oracle over `main.log`.** UI milestones alone cannot see silent fallbacks, swallowed exceptions, or unsettled warmup branches; the logs are already captured as CI artifacts, so asserting on them is close to free.
4. **PR gate is Linux-only.** Runner economics; multi-platform startup confidence belongs at tag time. Full trade-off and the incident behind it: ADR 0006.
5. **Release gate runs advisory until soaked.** A flaky gate blocking every release is worse than the gap it replaces. Wire `startup-gate` into `prepare-release` once `startup-gate` itself has run green on all three platforms across three consecutive tags (beta tags count — the job already runs on every `v*`). PR-tier green is not evidence for it: the release tier runs `inherited-update` on two platforms the PR tier never touches. Review date if the tags have not happened by then: 2026-10-01.
6. **Entry point is a Playwright Test spec, not a bare CLI script.** `_electron.launch()` hangs indefinitely under Bun; every working Electron launch in the repo rides the Playwright CLI, which `bunx` resolves through its `#!/usr/bin/env node` shebang into real Node. The tier rides in `ARROXY_STARTUP_TIER` because a spec takes no CLI args.
7. **Degraded journeys run nightly, non-blocking.** Forced offline (descoped — see Known gaps), software rendering, and PATH poisoning are inherently flaky to stage; gating every PR on them would make the gate flaky. Non-blocking still catches drift within a day.
8. **Profile copies preserve mtime and drop copied logs.** `ProbeVerdictCache` keys on mtime, so `cp -R` silently invalidates the cache under test; a copied `main.log` would let a stale "Warmup completed" satisfy the oracle for the wrong session.
9. **`ARROXY_E2E` / `MOCK_BACKEND` are stripped from journey env.** Those flags swap in mock providers and would mock away the exact branches the journeys exist to verify.
10. **Warm seeders are named, not positional.** A `warm` profile names the journey it clones (`{kind: 'warm', from: 'fresh-cold'}`) and every tier is preflighted by `validateTier` before any launch. The nightly once silently declared three warm journeys with no seeder — an array-order convention guarded by a comment — and it took three CI runners to find out.

## Known defects (open)

1. **Wire `startup-gate` into `prepare-release`** after the soak (see decision 5). Until then a broken macOS cold start can ship.

Fixed or resolved: the nightly's unseedable warm journeys (fixed — `fresh-cold` seeds the tier, named via decision 10) and the unenforceable `offline-no-cache` journey (descoped, see Known gaps). Nightly failures open a `startup-nightly` issue automatically (`startup-nightly.yml` `notify` job), so a red nightly reaches a human the same day.

## Known gaps

- No journey verifies genuinely-offline startup. `offline-no-cache` was removed rather than left unenforced; re-adding it needs portable egress blocking (`unshare -n` is Linux-only, `HTTPS_PROXY` is not honored by `node:https`), which is its own spike.

## Incidents

- 2026-06 → 2026-08: fake-`node` PATH leak made macOS/Linux cold start report green without launching Electron. Fixed structurally by decisions 1–2.
- 2026-08-30: stale required contexts (`Cold start (windows)` / `(macos-arm64)`) blocked every PR with phantom pending after the tier went Linux-only. Fixed; contract in `ci-cd-strategy.md`.
