---
name: remember
description: Persists a durable Arroxy lesson — a gotcha, user preference, workflow rule, or design decision — to the right tracked file (project memory, AGENTS.md, CONTEXT.md, dev-docs, or an ADR) so any coding agent sees it in future sessions. Use when the user says "remember this", corrects a repeated mistake, or a debugging session uncovers something non-obvious.
---

# Remember

Arroxy's knowledge lives in tracked files, never in a tool's private or user-scoped memory, so every agent (Claude Code, Codex, OpenCode, …) and every clone sees the same thing.

## Gate

Store it only if **both** hold:

1. A future agent would make a mistake or waste real time without it.
2. It cannot be learned by reading the code, tests, git history, or the existing docs.

One-off task state, anything already written down, and generic language knowledge are not memories.

## Route

| What it is | Where it goes |
| --- | --- |
| Rule every change must follow (command, convention, gate) | `AGENTS.md`, in the matching section |
| Domain term or naming decision | `CONTEXT.md` (implementation-free) |
| Hard-to-reverse design choice with a real trade-off | `docs/adr/NNNN-slug.md` |
| Feature/system explanation that outlives the work | `dev-docs/<topic>.md` |
| Gotcha, preference, symptom→cause map, external reference | `.agents/memory/<slug>.md` |

Prefer updating an existing entry over adding a new one. Delete memories that turn out to be wrong.

## Memory file format

```markdown
---
name: <kebab-case-slug matching the filename>
description: <one line; used to decide relevance at recall time>
metadata:
  type: user | feedback | project | reference
---

<the fact>

**Why:** <what went wrong or what motivated it>
**How to apply:** <the concrete trigger and action>
```

- `feedback` and `project` entries need the **Why** / **How to apply** lines.
- Convert relative dates to absolute ones.
- Keep secrets, hostnames, and credentials out — point to user-level config instead.
- Link related memories with `[[slug]]`.

Then add one line to `.agents/memory/MEMORY.md`:

```markdown
- [Title](slug.md) — short hook that tells a reader when it matters.
```

## Report

Tell the user which file(s) changed, what was added or removed, and why it passed the gate.
