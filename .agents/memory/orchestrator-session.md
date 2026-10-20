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
- **Unblocks without asking.** It resumes sessions after an app quit or a
  network drop, answers their routine questions (such as copy approval) itself
  and tells Antonio in one line, and asks Antonio only for real product calls.
- **Watches for patch clusters.** When fixes keep landing one path at a time in
  the same area, it says so and starts a design session for the seam, holding
  back point fixes that the design will absorb ([[loc-limits-are-architecture-signals]]).

**Why:** Antonio wants the backlog worked down in parallel without having to
coordinate sessions or relay bugs himself, and he warned that audit findings
are often wrong.

**How to apply:** keep replies to a status table plus whatever needs his
decision; don't narrate each session's turn.
