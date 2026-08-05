---
name: no-ai-attribution
description: Never put AI/assistant attribution in commit messages, PR bodies, or code — no Co-Authored-By, no "Generated with" line.
metadata:
  type: feedback
---

Commits and PRs in this repo carry no AI attribution. Do not append
`Co-Authored-By: Claude ... <noreply@anthropic.com>`, a
`🤖 Generated with [Claude Code]` line, or any equivalent to commit messages, PR
bodies, or code comments. Author and committer stay Antonio.

**Why:** Antonio's explicit standing instruction — "never". This overrides the
default harness guidance that asks for those trailers; user instructions win.

**How to apply:** write the commit body and stop — no trailer. Before proposing
a PR, verify with:

```bash
git log main..HEAD --format="%B" | grep -inE "claude|anthropic|co-authored|generated with"
git log main..HEAD --format="%an <%ae> | %cn <%ce>" | sort -u
```

Both must come back clean. If trailers already slipped into unpushed commits,
strip them with `git filter-branch --msg-filter`, then delete `refs/original/*`
and run `git reflog expire --expire=now --all && git gc --prune=now` so the old
messages are not recoverable.

Note: 14 commits already on `main` carry these trailers from earlier sessions.
Leave them alone — that history is published, and rewriting it is destructive.
Unrelated mentions of `.claude/` or `CLAUDE.md` as tooling paths are fine; this
is about authorship credit only. See [[finish-before-pr]].
