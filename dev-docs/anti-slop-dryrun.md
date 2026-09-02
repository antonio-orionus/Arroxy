# anti-slop dry run — selective-adoption evidence

**Regenerated:** 2026-09-02 11:56 EEST  
**Repository:** [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop)  
**Upstream version:** v0.1.2  
**Upstream commit:** `e8c4880471b23ab7f216fba7b27d173a6ef07d4c` (`chore: prepare v0.1.2`)  
**Mode:** Read-only probe against the clean `big-refactor` worktree

## Provenance and feasibility

Upstream publishes no official registry package and says the plugin is intended to be vendored. The audited source is a TypeScript Oxlint plugin whose runtime import is `@oxlint/plugins`; source inspection found no network, child-process, or dynamic-execution surface in `src/` or `scripts/`. The v0.1.2 package pins both `@oxlint/plugins` and `oxlint` to `1.78.0`.

The dry run used an external probe config and did not modify Arroxy's lint configuration:

```bash
bun install --ignore-scripts                    # in /tmp/arroxy-anti-slop-upstream
bunx oxlint --config probe/oxlint.config.ts --format=github \
  /Users/antonio/code/antonio-orionus/arroxy/.worktrees/big-refactor/src \
  /Users/antonio/code/antonio-orionus/arroxy/.worktrees/big-refactor/packages \
  /Users/antonio/code/antonio-orionus/arroxy/.worktrees/big-refactor/scripts \
  /Users/antonio/code/antonio-orionus/arroxy/.worktrees/big-refactor/tests \
  > dev-docs/anti-slop-dryrun-findings.txt
```

The raw output contains 1,827 lines: 1,789 `anti-slop(...)` diagnostics and 38 unrelated Oxlint warnings. The raw output is retained at `dev-docs/anti-slop-dryrun-findings.txt` so the estimates below remain auditable.

## Current results

Counts below were parsed programmatically from the raw output by rule and source tree. `packages` had no anti-slop diagnostics.

| Rule | src | tests | scripts | packages | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| `require-safety-comment-for-type-assertion` | 175 | 717 | 13 | 19 | **924** |
| `no-runtime-typeof` | 117 | 29 | 40 | 20 | **206** |
| `no-chained-type-assertions` | 6 | 128 | 0 | 0 | **134** |
| `no-unknown-parameters` | 90 | 20 | 19 | 3 | **132** |
| `no-known-value-widening` | 73 | 26 | 5 | 2 | **106** |
| `no-unsafe-dictionary-type` | 44 | 32 | 6 | 5 | **87** |
| `no-conditional-empty-object-spread` | 67 | 14 | 2 | 3 | **86** |
| `no-module-mocking` | 0 | 59 | 0 | 0 | **59** |
| `no-shape-in-symbol-names` | 28 | 3 | 0 | 0 | **31** |
| `no-unknown-returns` | 9 | 13 | 2 | 0 | **24** |
| `no-object-parameters` | 0 | 0 | 0 | 0 | **0** |
| `no-reflect-apply` | 0 | 0 | 0 | 0 | **0** |
| `no-reflect-get` | 0 | 0 | 0 | 0 | **0** |
| `no-unknown-type-aliases` | 0 | 0 | 0 | 0 | **0** |
| `no-widen-then-assert` | 0 | 0 | 0 | 0 | **0** |
| **Tree total** | **609** | **1,041** | **87** | **52** | **1,789** |

The six production `no-chained-type-assertions` diagnostics are the planned findings in `App.tsx`, `browserMock.ts`, `tallyWidget.ts`, `StepConfirm.tsx`, and `SettingsStore.ts`.

The three rejected doctrine rules currently produce 251 `src/` diagnostics: `no-unknown-parameters` 90, `no-runtime-typeof` 117, and `no-unsafe-dictionary-type` 44. These current counts supersede the older 247-finding snapshot for this worktree and are not treated as independent defects without source/data-flow classification.

## Decision record

Adopt exactly these six rules as errors after the production chained assertions are removed:

- `anti-slop/no-widen-then-assert`
- `anti-slop/no-unknown-type-aliases`
- `anti-slop/no-reflect-apply`
- `anti-slop/no-reflect-get`
- `anti-slop/no-object-parameters`
- `anti-slop/no-chained-type-assertions` (disabled only for test globs)

The other nine rules remain outside CI policy. In particular, `no-unknown-parameters` and `no-runtime-typeof` conflict with validated trust-boundary parsing and legitimate typed-union/capability narrowing; `no-unsafe-dictionary-type`, `no-known-value-widening`, and `no-unknown-returns` remain audit-only; and the remaining syntax/test/name rules are rejected or deferred by the supplied selective-adoption plan.

The plan's exact calculation for its original proposed directory override globs is **127 exempted / 120 enforced**, not the unsupported 147/100 split. That historical calculation is retained as a decision correction; the current tree's findings above are the enforcement evidence for this implementation.
