---
name: approve-design-before-tests
description: During UI design iteration, show mocks and screenshots and get the design approved before writing tests or running test suites.
metadata:
  type: feedback
---

While a UI design is still being chosen or refined, iterate visually only: mocks,
browser-mock screenshots, quick edits. Write tests, run `bun run check`, browser
specs or E2E only after the user approves the design.

**Why:** the user rejected several format-picker designs in a row (2026-10-17);
tests written for a design that gets thrown away are wasted work, and long test
runs delay the next visual round the user is waiting on.

Repeated 2026-10-19 ("don't focus on tests at all while we prototype"), after a
Review-screen session drifted into TDD for each UI tweak. That covers UX flow
changes too (new buttons, dialogs, callouts), not only visual restyles.

**How to apply:** read this before starting any UI/UX iteration; it overrides the
AGENTS.md TDD default until the user approves. For redesign, UX-flow or "make it look better" requests, the loop is
mock → user picks → build → screenshot → user approves → then TDD hardening
and gates per AGENTS.md. The TDD rule still holds for logic and bug fixes, and
for the design itself once it is approved. Related: [[translate-at-final-stage]].
