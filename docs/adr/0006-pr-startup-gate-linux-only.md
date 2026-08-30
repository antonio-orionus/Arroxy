# The PR startup gate runs on Linux only

Startup verification runs on every PR, but only on Linux. Windows and macOS
startup confidence is the release gate's job: `startup-gate` runs the same
journeys on all three platforms on every tag (blocking once wired), and the
nightly runs degraded-environment journeys on all three platforms.

The split is driven by cost versus when the answer matters. Multi-platform
startup verification on every push means slow, expensive Windows and macOS
runner time on every PR, to catch what the release gate will catch anyway
before anything can publish. The PR gate's job is fast feedback on the
journey harness itself, where flakiness is cheap to discover.

## Consequences

`main`'s branch-protection contract must follow the platform scope exactly:
required checks may only name contexts a PR workflow actually reports. This
was learned the hard way twice — first as a silent no-op (the fake-`node`
PATH leak let macOS and Linux cold start report green without launching
Electron from 2026-06 to 2026-08), then as phantom-pending: when the PR tier
went Linux-only, the stale required contexts `Cold start (windows)` and
`Cold start (macos-arm64)` blocked every PR with checks that could never
start. Tag-only and scheduled jobs must never become required PR contexts —
including `startup-gate` itself once it is wired into `prepare-release`.

This decision's own argument — "the release gate will catch it anyway before
anything can publish" — is a promise, not yet a fact: `startup-gate` is in no
job's `needs:`, so a red gate currently stops nothing. Until it is wired,
automated Windows and macOS startup coverage is the nightly alone. Wiring it is
the precondition that makes this ADR true; the criterion and review date live
in the NOTE above `startup-gate` in `release.yml`.
