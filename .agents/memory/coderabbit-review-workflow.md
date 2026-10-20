---
name: coderabbit-review-workflow
description: CodeRabbit reviews are a scarce, repo-wide quota (2/hour, 100 files/PR) and automatic reviews are OFF, so every review needs a manual trigger; only PRs that change behaviour get one (never mechanical or behaviour-free refactor PRs), riskiest first; spend triggers strategically — finish all local review (Codex, gates) first, trigger once when the head is final, never push while a review runs (it aborts with "Head commit changed" and burns the trigger); poll issues/<N>/comments for all outcomes; never merge on green CI alone.
metadata:
  type: feedback
---

**Automatic reviews are disabled in this repository.** Nothing reviews itself —
not the PR at open, and not the commits pushed onto it afterwards. Every review
happens because someone typed `@coderabbitai review`.

Trigger it **right after opening the PR**, then verify each finding and fix what
is valid. Do not merge on a green CI alone.

**Antonio (2026-09-14): do not re-trigger for small follow-ups — the initial
review is usually enough.** Only spend the second trigger when the commits
pushed after the first review are substantial (new logic, not just review-fix
tweaks). The rest of this section explains why a second trigger is ever needed.

## Which PRs get a trigger

**Antonio (2026-10-20): splitting PRs per concern drained the quota faster**, because
each split-off PR took its own trigger. CodeRabbit reviews a change in behaviour,
not a PR:

- **No trigger** for mechanical PRs (formatting, licence headers, dependency
  bumps, locale sync, regenerated files) or behaviour-free refactors and renames.
  Codex and `bun run check` cover them: a refactor that changes behaviour shows
  up as failing tests or types. In a split feature, only the PR that changes
  behaviour spends a trigger; a `packages/*` change that carries the new
  behaviour is that PR, and the app PR wiring it in is plumbing.
- **Riskiest first when the quota is tight:** IPC and preload, release and build,
  persistence and settings, the download pipeline. A small, well-tested renderer
  fix can go with Codex alone rather than wait an hour for a slot.

## Spend triggers strategically: they are not unlimited

**Antonio (2026-10-19): be strategic with manual triggers — the quota is not
unlimited.** Every trigger, including one that fails, spends part of the
2-per-hour allowance shared by every PR in the repo. Plan around it:

- **Trigger last, on a final head.** Run every local review first (Codex,
  `bun run check`, self-review), fix and push what they find, and only then
  type `@coderabbitai review`. One trigger then covers everything.
- **Never push while a review is running.** CodeRabbit drops an in-flight
  review when the head moves: the trigger reply edits itself to
  "⚠️ Action not completed — Head commit changed", nothing gets reviewed, and the
  trigger is gone. On PR #334 a Codex fix pushed two minutes after the trigger
  threw away the whole first review. Hold commits locally (or batch them) until
  the outcome lands, even docs or memory edits.
- **Wait for a terminal outcome before deciding anything** (table below), then
  batch every fix into one push.
- **The second trigger is the exception.** Spend it only when the fixes add real
  new logic (see the next paragraph); a small review-fix tweak is not worth a
  quota unit.

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
triggers per PR is the ceiling, not the norm: one on the final head, a second
only when the fixes added new logic. Anything beyond that needs a reason. The walkthrough comment states the allowance outright — "Your plan
provides up to 2 included reviews per hour; 1 remains after this review."

**A green CodeRabbit check is never evidence a review happened.** With auto
reviews off the check reports `pass` with the text "Review skipped: automatic
reviews are disabled" — a pass that means the exact opposite of reviewed. On
PR #164 the check was green with no review at all, so merging on CI status would
have skipped review entirely.

## Hard limits: 100 files per PR, 2 reviews per hour

**A PR over 100 files is skipped outright** — "Review skipped: Too many files!
This PR contains 143 files, which is 43 over the limit of 100" (PRs #275/#276,
2026-10-16). The count is taken after `.coderabbit.yaml` path_filters, so
generated READMEs and excluded locale files don't count, but every source,
test, and doc file does. The plan label says "Advanced" yet the cap is 100, not
the 150/300 that CodeRabbit's public release notes list for paid tiers — trust
the bot's own message, not the docs.

For a bigger change, split it into **stacked review PRs of ≤100 files each**
(e.g. core src → unit tests → renderer → e2e/docs/locales), each based on the
one below. Merge them top-down into their bases, then squash-merge the bottom
PR into `main`. A partial branch fails CI on its own; only the final squash
needs to be green. Before opening, count each PR's files with the path_filters
applied, and keep `.coderabbit.yaml`'s locale exclusion list complete — newer
locales missing from it pushed one half of the 0.5.0 split over the cap.

**The 2-reviews-per-hour quota is shared across the repo.** A stack of N PRs
needs about N/2 hours of triggers: trigger two, wait for the window, trigger
the next two. A refused trigger replies "rate limited" and is never retried on
its own — re-trigger it after the window.

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

**Never filter by `created_at`.** The walkthrough carrying `No actionable
comments` is the summary comment CodeRabbit posted when the PR opened, edited
in place when the review finishes — its `created_at` predates your trigger and
only `updated_at` moves. On PR #262 a poll restricted to comments created after
the trigger sat for 30 minutes on a review that had finished in 3.

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
