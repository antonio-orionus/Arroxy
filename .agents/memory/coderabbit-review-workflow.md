---
name: coderabbit-review-workflow
description: Trigger a CodeRabbit review once per PR at open, never again after fixes; watch for rate-limit refusals, and never merge on green CI alone.
metadata:
  type: feedback
---

Trigger `@coderabbitai review` **exactly once per PR, right after opening it**.
Wait for that review, then verify each finding and fix what is valid. Do not
merge on a green CI alone.

**Never re-trigger after pushing fixes.** One manual trigger per PR, full stop.
CodeRabbit reviews incrementally and picks up later commits on its own, so a
second trigger buys nothing and burns a review from a limited quota that is
shared across every PR in the repo.

**Why:** CodeRabbit's status check can report `pass` while it has posted zero
comments — a passing check is not evidence a review happened. On PR #164 the
check was green with no review at all, so merging on CI status would have
skipped review entirely.

**How to apply:**

```bash
gh pr comment <N> --body "@coderabbitai review"
sleep 10
# ALWAYS read the immediate reply before waiting on anything. It says either
# "Action performed: Review trigger" (accepted) or "Review rate limited".
gh api repos/antonio-orionus/Arroxy/issues/<N>/comments --jq '.[-1].body' | head -20
# only then poll for the review itself
gh api repos/antonio-orionus/Arroxy/pulls/<N>/reviews --jq '.[-1] | "\(.user.login) \(.submitted_at)"'
```

**The free OSS tier has a review limit**, and a refused trigger is never
retried — the PR simply sits there. The refusal is posted to
`repos/<owner>/<repo>/issues/<N>/comments` (the general PR stream), **not** to
`pulls/<N>/reviews` or `pulls/<N>/comments`. Polling only the latter two makes a
hard refusal look identical to a slow review; that wasted an hour on PR #165,
where the "Review limit reached — next review available in 26 minutes" reply had
arrived 3 seconds after the trigger.

Any wait loop must therefore watch for refusal as well as success — matching
`rate limited|Review limit reached|Action not completed` — so silence is never
mistaken for progress.

This is what the one-trigger rule protects. On PR #164 a second trigger was
spent re-reviewing work whose first review had already landed and been
addressed; the quota that consumed is what left PR #165 unable to start a
review at all.

Evaluate findings against the code before implementing — see
[[receiving-review-verify-first]]. Reply in the inline comment thread
(`pulls/<N>/comments/<id>/replies`), not as a top-level PR comment. Push back
with evidence when a finding rests on a wrong premise; fix it when it does not.

Related: [[finish-before-pr]], [[no-ai-attribution]].
