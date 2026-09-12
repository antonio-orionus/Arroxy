---
name: coderabbit-review-workflow
description: Automatic reviews are OFF in this repo, so every CodeRabbit review needs an explicit trigger — once at open and once after pushing review fixes; poll issues/<N>/comments for all three outcomes because pulls/<N>/reviews stays 0 on a clean review; never merge on green CI alone.
metadata:
  type: feedback
---

**Automatic reviews are disabled in this repository.** Nothing reviews itself —
not the PR at open, and not the commits pushed onto it afterwards. Every review
happens because someone typed `@coderabbitai review`.

Trigger it **right after opening the PR**, then verify each finding and fix what
is valid. Do not merge on a green CI alone.

**Trigger again after pushing review fixes — once.** This reverses the earlier
rule in this file, which said a second trigger buys nothing because CodeRabbit
picks up later commits on its own. It does not, because that behaviour belongs
to automatic reviews and this repo has them off. On PR #220 the review covered
only the two commits present at open (`final_review_risk_coverage` named the
head commit twice); the commit that fixed its own findings sat unreviewed and
would have merged that way. The trigger reply states the mechanic outright:

> CodeRabbit is an incremental review system and does not re-review already
> reviewed commits. This command is applicable only when automatic reviews are
> paused.

So the second trigger is cheap in scope — it reads only the new commits — but
still spends one unit of a limited quota shared across every PR in the repo. Two
triggers per PR is the budget: open, and after fixes. Anything beyond that needs
a reason. The walkthrough comment states the allowance outright — "Your plan
provides up to 2 included reviews per hour; 1 remains after this review."

**A green CodeRabbit check is never evidence a review happened.** With auto
reviews off the check reports `pass` with the text "Review skipped: automatic
reviews are disabled" — a pass that means the exact opposite of reviewed. On
PR #164 the check was green with no review at all, so merging on CI status would
have skipped review entirely.

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

Count findings as **top-level bot comments only** — your own replies land in
`pulls/<N>/comments` too, so a bare `length` grows every time you answer a
thread and a re-review looks like it found something when it did not:

```bash
gh api repos/antonio-orionus/Arroxy/pulls/<N>/comments \
  --jq '[.[] | select(.user.login=="coderabbitai[bot]") | select(.in_reply_to_id == null)] | length'
```

Run the same trigger a second time once the fixes are pushed, and read the
coverage marker to confirm the new commits were the ones reviewed.

## Confirm coverage before trusting a clean result

"No actionable comments" is only meaningful if it reviewed the right files and
the right commits.

**Commits.** The walkthrough body carries an HTML comment naming exactly what
was covered — grep it rather than trusting the prose:

```bash
gh api repos/antonio-orionus/Arroxy/issues/<N>/comments \
  --jq '.[].body' | grep -o 'final_review_risk_coverage:{[^}]*}'
```

`coveredCommitId` must equal your pushed head. On PR #220 it named the commit
from PR-open time while two later commits sat unreviewed.

**Files.** The walkthrough also carries **Files selected for processing** and
**Files ignored due to path filters**. Read the file lists, not the summary
prose next to them — on PR #220 that prose claimed five locales carried the new
status string when the diff changed all 24. The summary is a paraphrase and is
routinely wrong about counts; the diff is the truth.

`.coderabbit.yaml` excludes `.agents/**`, so memory files are *never* reviewed.
That is configuration, not a miss — do not read it as incomplete coverage.

Evaluate findings against the code before implementing — see
[[receiving-review-verify-first]]. Reply in the inline comment thread
(`pulls/<N>/comments/<id>/replies`), not as a top-level PR comment. Push back
with evidence when a finding rests on a wrong premise; fix it when it does not.

Related: [[finish-before-pr]], [[no-ai-attribution]].
