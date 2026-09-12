---
name: coderabbit-review-workflow
description: Trigger a CodeRabbit review once per PR at open; poll issues/<N>/comments for all three outcomes (findings, clean, refusal) because pulls/<N>/reviews stays 0 on a clean review; never merge on green CI alone.
metadata:
  type: feedback
---

Trigger `@coderabbitai review` **exactly once per PR, right after opening it**.
Wait for that review, then verify each finding and fix what is valid. Do not
merge on a green CI alone.

**Never re-trigger after pushing fixes.** One manual trigger per PR, full stop.
CodeRabbit reviews incrementally and picks up later commits on its own, so a
second trigger buys nothing and burns a review from a limited quota that is
shared across every PR in the repo. The walkthrough comment states the budget
outright — "Your plan provides up to 2 included reviews per hour; 1 remains
after this review."

**Why:** CodeRabbit's status check can report `pass` while it has posted zero
comments — a passing check is not evidence a review happened. On PR #164 the
check was green with no review at all, so merging on CI status would have
skipped review entirely.

## Every outcome lands on `issues/<N>/comments`

This is the part that keeps costing time. **`pulls/<N>/reviews` is not a
success signal** — it stays `0` for a clean review, and `pulls/<N>/comments`
stays `0` too. All three terminal outcomes are posted to the general PR comment
stream instead:

| Outcome | Text to match in `issues/<N>/comments` |
| --- | --- |
| Findings | inline comments appear in `pulls/<N>/comments` **and** a walkthrough lands here |
| Clean | `No actionable comments were generated` |
| Refused | `rate limited` / `Review limit reached` / `Action not completed` |

Polling only `pulls/<N>/reviews` makes **clean** and **refused** and **never
started** all look identical — an endless zero. That wasted an hour on PR #165
(a refusal that had arrived 3 seconds after the trigger) and again on PR #219
(a clean review that had been complete for the better part of an hour while the
watch sat on the wrong endpoint).

Any wait loop must therefore treat all three as terminal, so silence is never
mistaken for progress.

## How to apply

```bash
gh pr comment <N> --body "@coderabbitai review"
sleep 10
# ALWAYS read the immediate reply first: "Action performed: Review trigger"
# (accepted) or "Review rate limited" (refused, never retried on its own).
gh api repos/antonio-orionus/Arroxy/issues/<N>/comments --jq '.[-1].body' | head -20

# then poll the comment stream for ANY terminal outcome
gh api repos/antonio-orionus/Arroxy/issues/<N>/comments \
  --jq '[.[] | select(.user.login=="coderabbitai[bot]") | .body] | join(" ")' \
  | grep -ciE "No actionable comments|rate limited|Review limit reached|Action not completed"
gh api repos/antonio-orionus/Arroxy/pulls/<N>/comments --jq 'length'   # findings
```

## Confirm coverage before trusting a clean result

"No actionable comments" is only meaningful if it reviewed the right files. The
walkthrough comment carries both lists — expand **Files selected for
processing** and **Files ignored due to path filters** and check the commit
range it names (`Reviewing files that changed ... between <base> and <head>`)
covers every commit you pushed.

`.coderabbit.yaml` excludes `.agents/**`, so memory files are *never* reviewed.
That is configuration, not a miss — do not read it as incomplete coverage.

Evaluate findings against the code before implementing — see
[[receiving-review-verify-first]]. Reply in the inline comment thread
(`pulls/<N>/comments/<id>/replies`), not as a top-level PR comment. Push back
with evidence when a finding rests on a wrong premise; fix it when it does not.

Related: [[finish-before-pr]], [[no-ai-attribution]].
