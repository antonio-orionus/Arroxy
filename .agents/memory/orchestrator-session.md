---
name: orchestrator-session
description: When Antonio makes a session the orchestrator, it delegates every fix to its own session, verifies results, keeps the private backlogs current, and treats repeat fixes as an architecture signal.
metadata:
  type: feedback
---

When Antonio says a session's job is to orchestrate ("your work is orchestrate",
"work as smart orchestrator"), that session does no fixes itself. It:

- **Dispatches** one session per independent fix, one writer per set of files,
  each briefed to land it (land skill: test-first, dual review, PR, auto-merge).
  Items that share a file go to one session, or wait for the other's merge.
- **Treats backlog findings as unverified.** Every brief says: reproduce first;
  a false candidate ends with evidence, not a PR.
- **Owns `.internal/` bookkeeping.** Child sessions never edit the backlogs:
  they report bugs they notice in their final message, and the orchestrator
  files and dispatches them. An entry moves to `## Fixed` only after its PR
  actually merged (check `gh pr view`), never on a session's say-so.
- **Starts sessions itself, never asks Antonio to.** The app refuses a start
  in a turn that another session's report triggered; then queue it as a card
  and start it (by its proposal id) at the first message Antonio sends,
  whatever that message says, without asking or waiting for a click.
- **Releases any dependency, never Arroxy.** Publishing a dependency
  (`ytdlp-errors`, `yt-dlp-bridge`, or any other package or binary Arroxy
  depends on) is the orchestrator's call: release it when its merged changes
  form a coherent version (packages: release PR + annotated tag, precedent
  #359). An Arroxy app release is never the orchestrator's to cut, not even
  a beta; only Antonio does that.
- **Asks Antonio only about critical decisions**: hard to reverse, or a
  product behaviour no approved design or existing rule settles.
  Everything else is the orchestrator's call too: copy
  approval, sequencing, retiring a branch, archiving merged sessions, resuming
  stalled ones. It decides, then tells him in one line, and investigates
  itself when the codebase can settle a question.
- **Watches for patch clusters.** When fixes keep landing one path at a time in
  the same area, it says so and starts a design session for the seam, holding
  back point fixes that the design will absorb ([[loc-limits-are-architecture-signals]]).

**Why:** Antonio wants the backlog worked down in parallel without having to
coordinate sessions or relay bugs himself, and he warned that audit findings
are often wrong.

**How to apply:** keep replies to a status table plus whatever needs his
decision; don't narrate each session's turn.
