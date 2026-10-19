# One recovery policy for yt-dlp runs

Status: proposed, 2026-10-19. Plan and evidence: [download-recovery-plan.md](../../dev-docs/download-recovery-plan.md).

Five places decide independently what to do when a yt-dlp run fails or comes back
limited: the token ladder, the probe's timeout and degradation retries, the media
phase's cached-metadata and cookieless recovery, account escalation with cookie
verification, and the queue's automatic retry. Each was reasonable on its own.
Together, they relaunch identical commands (two of the three token-ladder steps
on every YouTube media download carry the same parsed configuration), answer a
rate limit by retrying within a millisecond, and give no single answer to "why
did Arroxy stop?". There is also no place where a rate limit seen by one probe
can hold back the next job on the same site.

We will make recovery one pure function. It takes the operation, the identity
actually in use, what the attempt history already tried, the evidence the last
run produced, and a launch budget and deadline. It returns one decision: launch
a stated strategy, finish, defer until a time, or ask the user. Every decision
carries a reason. A launch is allowed only if its fingerprint is new for that
operation. The fingerprint covers the rendered extractor configuration, with
token and cookie-jar secrets replaced by generation counters, plus the identity
and whether cached metadata is reused. So a real token re-mint or a verified
cookie refresh counts as new, and a launch that differs only in a temporary path
does not. The one exception is retrying a transient failure after a backoff. This rule is what makes "never repeat an attempt that cannot change
the outcome" testable rather than aspirational.

Two companions make the rule enforceable. First, the bridge owns extractor
options as typed data and renders exactly one `--extractor-args` per extractor,
because yt-dlp replaces earlier blocks for the same extractor rather than
merging them. Second, a shared per-site state holds rate-limit cooldowns and the
anonymous bot-wall streak, so probes, jobs and automatic retries all respect one
signal.

Alternatives we rejected:

- **Fix only the argument order.** It removes the immediate defect, but leaves
  the five decision-makers, the identical relaunches outside the token ladder,
  and the missing cooldown.
- **Wrap launches in a resilience library such as cockatiel.** Its retry repeats
  the same call, while every attempt here must change argv or identity and record
  why. Its circuit breaker opens on failure counts, not on a wall-clock cooldown
  that has to be shared across operations.
- **A state machine library.** The decision is a table over evidence and history,
  not a long-lived lifecycle. A pure function is easier to property-test.

Rate limits never trigger a change of identity, and the anonymous PO token never
travels with any cookies. Both follow ADR 0008's rule that the account is used
only where it can fix the failure.

Still open: whether the anonymous token is used first or only on demand. A
bounded live comparison decides this before the first release that makes
the token effective again, and the result will be recorded here.
