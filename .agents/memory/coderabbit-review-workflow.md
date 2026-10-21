---
name: coderabbit-review-workflow
description: CodeRabbit is a scarce, adaptive repo-wide quota (2 reviews/hour, 100 files/PR) with automatic reviews OFF; trigger only behaviour-changing PRs, once, on a final head after CI is green, one retry at most; never push mid-review; read outcomes from issues/<N>/comments; a green CodeRabbit check proves nothing.
metadata:
  type: feedback
---

**Automatic reviews are off.** Nothing is reviewed unless someone comments
`@coderabbitai review`, neither at PR open nor after later pushes. A green
CodeRabbit check means nothing: with auto reviews off it passes with "Review
skipped: automatic reviews are disabled" (PR #164 was green with no review).

## Who gets a trigger

The allowance is 2 reviews per hour for the whole repo, failed triggers
included (Antonio, 2026-10-19: "be strategic"). CodeRabbit reviews a change in
behaviour, not a PR (Antonio, 2026-10-20, after per-concern splits drained it).
It is the third reviewer: the local dual review (`bun run review:dual`, run by
the `land` skill) has already checked every PR before it opens.

- **No trigger** for mechanical PRs (formatting, licence headers, dependency
  bumps, locale sync, regenerated files) or behaviour-free refactors; the light
  dual review and `bun run check` cover them. In a split feature only the PR that changes
  behaviour gets one.
- **Riskiest first** when the quota is tight: IPC and preload, release and
  build, persistence and settings, the download pipeline. A small, well-tested
  renderer fix can merge on the local reviews alone.
- **Over 100 files** (counted after `.coderabbit.yaml` path_filters) the review
  is skipped outright, whatever the plan label says. Skip the trigger and say
  so in the PR (land phase 8); never stack PRs to get under the cap. Keep the
  locale exclusion list in `.coderabbit.yaml` complete.

## When to trigger

- **Last, on a final head, after CI is green.** Run every local review and gate
  first, push the fixes, wait for CI, then trigger once. A review spent on a head
  CI then fails is wasted: the fix needs a new head anyway.
- **No retry loops.** The limit is adaptive: every trigger, refused ones
  included, and every push or rebase on a PR counts as a review, and heavy use
  drops the allowance (CodeRabbit's rate-limit docs). On 2026-10-20 watchers
  re-triggering after every cooldown spent 47 triggers for 13 reviews (33
  refused), and median CodeRabbit wait was 27 minutes. A refused trigger gets one
  retry, after the cooldown the refusal names; refused again, merge on the local
  reviews and say so in the PR. Never run a `--auto-retry` watcher on several PRs
  at once.
- **Never push while a review runs.** CodeRabbit drops the review when the head
  moves ("Action not completed — Head commit changed") and the trigger is spent
  (PR #334 lost its whole first review to a fix pushed two minutes later). Hold
  even docs or memory commits until the outcome lands, then batch fixes into one
  push.
- **A second trigger only when the fixes add new logic** (Antonio, 2026-09-14).
  It is needed then: reviews are incremental and do not pick up later commits
  with auto reviews off (PR #220 merged-ready with its fix commit unreviewed).
  Two per PR is the ceiling.
- A refused trigger ("rate limited") is never retried by the bot. The one
  retry above waits for the window the refusal names ("Next included review
  available in N minutes").
- **The first reply can flip.** On PR #386 (2026-10-20) the trigger reply read
  "Review triggered", then edited itself to "Action not completed — Review rate
  limited" seconds later. Wait ~30 s before reading it, and treat the review as
  accepted only once no refusal follows.

## Reading the outcome

Every terminal outcome lands in `issues/<N>/comments`; `pulls/<N>/reviews`
stays `0` for clean, refused and never-started alike (an hour lost on PR #165
and again on #219).

| Outcome | Match in `issues/<N>/comments` |
| --- | --- |
| Findings | walkthrough here, inline comments in `pulls/<N>/comments` |
| Clean | `No actionable comments were generated` |
| Refused | `rate limited` / `Review limit reached` / `Action not completed` |

```bash
gh pr comment <N> --body "@coderabbitai review"
gh api repos/antonio-orionus/Arroxy/issues/<N>/comments --jq '.[-1].body' | head -20   # accepted or refused?
gh api repos/antonio-orionus/Arroxy/issues/<N>/comments \
  --jq '[.[] | select(.user.login=="coderabbitai[bot]") | .body] | join(" ")' \
  | grep -ciE "No actionable comments|rate limited|Review limit reached|Action not completed"
gh api repos/antonio-orionus/Arroxy/pulls/<N>/comments \
  --jq '[.[] | select(.user.login=="coderabbitai[bot]" and .in_reply_to_id == null)] | length'   # findings, not your replies
gh api repos/antonio-orionus/Arroxy/issues/<N>/comments --jq '.[].body' | grep -o 'final_review_risk_coverage:{[^}]*}'
```

- **Never filter by `created_at`:** the walkthrough is the comment posted at PR
  open, edited in place; only `updated_at` moves (PR #262 sat 30 minutes on a
  review finished in 3).
- **Judge against the current head.** An Auto-fix wake-up can relay a reply
  written for an earlier head; twice on 2026-10-20 a session re-triggered a
  finished review or reported one as running. `coveredCommitId` in the coverage
  marker must equal the pushed head.
- **Read the file lists, not the summary prose** ("Files selected for
  processing"); the prose is routinely wrong about counts. `.agents/**` is
  excluded by config, so memory files are never reviewed; `review-learnings.md`
  still reaches CodeRabbit as a code guideline, with the same "no security
  hardening" scope as the local review.

Check each finding against the code before acting on it, fix what holds, and
answer the rest in its inline thread (`pulls/<N>/comments/<id>/replies`) with
evidence. A false alarm that will recur goes into [[review-learnings]]. Related: [[finish-before-pr]], [[no-ai-attribution]].
