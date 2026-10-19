---
name: no-betas
description: Arroxy ships stable releases only. Never plan, propose or cut a -beta.N release, and never use "one beta" as a rollout or shadow-mode gate.
metadata:
  type: feedback
---

Antonio does not want beta releases ("no betas!", 2026-10-19). `bun run release:beta` and the `-beta.N` tag path exist in the pipeline, but plans must not depend on them.

**Why:** he rejected a plan step that gated the PO-token behaviour change on a beta, and that step had cost nothing to propose. A risky change is de-risked before the merge instead, with live smoke comparisons, fixture E2E, and shadow-mode logging that ships in a normal release.

**How to apply:** when a plan needs a staged rollout, use evidence gathered before the merge, or log-only shadow mode in a stable release. Releasing still needs an explicit "release" ([[ship-means-merge-not-release]]).
