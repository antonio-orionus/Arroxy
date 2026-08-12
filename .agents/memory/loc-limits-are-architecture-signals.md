---
name: loc-limits-are-architecture-signals
description: Never raise the LOC cap to land a change — hitting it means the file has too many responsibilities, so extract a cohesive concern instead.
metadata:
  type: feedback
---

When `bun run check:loc` fails, treat it as a design finding, not a gate to
negotiate. Do not pass `--max <larger>`, and do not propose raising
`DEFAULT_MAX` in `scripts/check-ts-max-loc.mjs`. Split the file by extracting a
cohesive concern into its own module.

**Why:** a file at the cap is already carrying more responsibilities than it
should. Raising the limit weakens the gate for every file in the repo to hide
one file's accumulated debt, and the next feature to touch that file inherits a
worse problem. The cap existing at 800 with a ~700 soft target is deliberate.

**How to apply:** when a change pushes a file over, first extract the concern
the change itself introduced. If the file is still over, it was already too big
— extract another genuinely separate responsibility rather than shaving lines
or trimming comments. Prefer concerns with existing test coverage so the
extraction is verifiable. Mention unrelated extractions in the PR description
so the scope is visible; see [[finish-before-pr]].
