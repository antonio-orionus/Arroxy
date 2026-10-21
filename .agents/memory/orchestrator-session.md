---
name: orchestrator-session
description: When Antonio says "orchestrator" or "orchestrate", load the `orchestrate` skill. It holds his standing rules for running other sessions.
metadata:
  type: feedback
---

When Antonio makes a session the orchestrator ("your work is orchestrate",
"work as smart orchestrator", "you are orchestrator"), load the `orchestrate`
skill (`.agents/skills/orchestrate/`) before doing anything else. The skill
holds the standing rules and the procedure, so they live in one place:

- dispatch, don't fix;
- findings are unverified;
- start sessions yourself;
- ask only critical decisions;
- release any dependency, never Arroxy;
- merged means `MERGED`;
- child sessions never touch `.internal/`;
- watch for patch clusters ([[loc-limits-are-architecture-signals]]).

**Why:** Antonio wants the backlog worked down in parallel without having to
coordinate sessions or relay bugs himself. He warned that audit findings are
often wrong. He corrected each of these rules once during the 2026-10-20/21
round ("dont ask to start from me", "you only can ask about critical
decisions", "publishing automatic", "you cant release arroxy").

**How to apply:** when he gives a new orchestration rule, add it to the
skill's Standing rules, not here.
