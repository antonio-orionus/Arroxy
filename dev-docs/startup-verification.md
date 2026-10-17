# Startup verification

| Lives in                                    |                                                                                                                       |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Journey catalog (data)                      | `scripts/startup/journeys.ts`                                                                                         |
| Runner / oracle / provisioner / verdicts    | `scripts/startup/runJourney.ts`, `logOracle.ts`, `provisionProfile.ts`, `checkVerdicts.ts`, `fetchPreviousRelease.ts` |
| Entry point (Playwright Test spec)          | `tests/e2e/startup-journeys.spec.ts`                                                                                  |
| Workflows                                   | `e2e-cold-start.yml` (pr), `release.yml` `startup-gate` (release), `startup-nightly.yml` (nightly)                    |
| Decision records                            | `docs/adr/0006` · map: `dev-docs/ci-cd-strategy.md`                                                                   |

## Current state (2026-10-17)

| Tier                                         | Status                                                                        |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| `pr` (Linux, blocking via branch protection) | blocking; green in CI and verified against a real packaged build (as of 2026-08-30; not re-checked) |
| `release` (all 3 platforms, on tags)         | blocking. `startup-gate` runs on every `v*` tag and `publish-release` needs it, so a red gate leaves the release a draft. Wired after it passed on all three platforms for the six tags `v0.4.25` to `v0.5.2` |
| `nightly` (all 3 platforms, scheduled)       | green — 5/5 verdicts on all three platforms as of 2026-08-30 ([run 33309036291](https://github.com/antonio-orionus/Arroxy/actions/runs/33309036291)); UNVERIFIED since |

Invocation: `ARROXY_STARTUP_TIER=<tier> PACKAGED_EXE=<exe> bun run verify:startup`.

## Decisions and why

1. **Journeys are data; one executor.** The replaced per-workflow bash launch scripts rotted independently — that is exactly how the cold-start check became a silent no-op for two months. One executor cannot rot on one platform while passing on another.
2. **Verdict accounting is the pass signal, not exit codes.** A missing verdict is a failure, so "ran nothing" and "passed" can never produce the same result. Confirmed on its first nightly run: the no-warm-source defect surfaced as loud red, not a fake pass.
3. **A pure log oracle over `main.log`.** UI milestones alone cannot see silent fallbacks, swallowed exceptions, or unsettled warmup branches; the logs are already captured as CI artifacts, so asserting on them is close to free.
4. **PR gate is Linux-only.** Runner economics; multi-platform startup confidence belongs at tag time. Full trade-off and the incident behind it: ADR 0006.
5. **Release gate soaked before it blocked, and gates publish, not build.** A flaky gate blocking every release is worse than the gap it replaces, so `startup-gate` ran advisory until it passed on all three platforms across consecutive tags (PR-tier green was not evidence: the release tier runs `inherited-update` on two platforms the PR tier never touches). It is wired into `publish-release` rather than `prepare-release` so builds run alongside it and the release takes no longer; builds only upload to a draft, so nothing user-visible happens before the gate's verdict.
6. **Entry point is a Playwright Test spec, not a bare CLI script.** `_electron.launch()` hangs indefinitely under Bun; every working Electron launch in the repo rides the Playwright CLI, which `bunx` resolves through its `#!/usr/bin/env node` shebang into real Node. The tier rides in `ARROXY_STARTUP_TIER` because a spec takes no CLI args.
7. **Degraded journeys run nightly, non-blocking.** Forced offline (descoped — see Known gaps), software rendering, and PATH poisoning are inherently flaky to stage; gating every PR on them would make the gate flaky. Non-blocking still catches drift within a day.
8. **Profile copies preserve mtime and drop copied logs.** `ProbeVerdictCache` keys on mtime, so `cp -R` silently invalidates the cache under test; a copied `main.log` would let a stale "Warmup completed" satisfy the oracle for the wrong session.
9. **`ARROXY_E2E` / `MOCK_BACKEND` are stripped from journey env.** Those flags swap in mock providers and would mock away the exact branches the journeys exist to verify.
10. **Warm seeders are named, not positional.** A `warm` profile names the journey it clones (`{kind: 'warm', from: 'fresh-cold'}`) and every tier is preflighted by `validateTier` before any launch. The nightly once silently declared three warm journeys with no seeder — an array-order convention guarded by a comment — and it took three CI runners to find out.

## Known defects (open)

None.

Fixed or resolved: wiring `startup-gate` into the release (it now gates `publish-release`, see decision 5), the nightly's unseedable warm journeys (fixed — `fresh-cold` seeds the tier, named via decision 10) and the unenforceable `offline-no-cache` journey (descoped, see Known gaps). Nightly failures open a `startup-nightly` issue automatically (`startup-nightly.yml` `notify` job), so a red nightly reaches a human the same day, and the first green run closes the issue again.

## Known gaps

- No journey verifies genuinely-offline startup. `offline-no-cache` was removed rather than left unenforced; re-adding it needs portable egress blocking (`unshare -n` is Linux-only; `HTTPS_PROXY` cannot force it — the startup runtime does not enable Node's env-proxy support via `NODE_USE_ENV_PROXY`), which is its own spike.

## Incidents

- 2026-06 → 2026-08: fake-`node` PATH leak made macOS/Linux cold start report green without launching Electron. Fixed structurally by decisions 1–2.
- 2026-08-30: stale required contexts (`Cold start (windows)` / `(macos-arm64)`) blocked every PR with phantom pending after the tier went Linux-only. Fixed; contract in `ci-cd-strategy.md`.
