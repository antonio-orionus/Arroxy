---
name: coderabbit-review-workflow
description: After pushing any PR, manually trigger a CodeRabbit review and wait for it before merging.
metadata:
  type: feedback
---

After opening or pushing to a PR, post `@coderabbitai review` as a PR comment,
wait for the review to finish, then verify each finding and fix what is valid.
Do not merge on a green CI alone.

**Why:** CodeRabbit's status check can report `pass` while it has posted zero
comments — a passing check is not evidence a review happened. On PR #164 the
check was green with no review at all, so merging on CI status would have
skipped review entirely.

**How to apply:**

```bash
gh pr comment <N> --body "@coderabbitai review"
# then poll until the review lands
gh api repos/antonio-orionus/Arroxy/pulls/<N>/reviews --jq '.[-1] | "\(.user.login) \(.submitted_at)"'
gh api repos/antonio-orionus/Arroxy/pulls/<N>/comments --jq 'length'
```

Evaluate findings against the code before implementing — see
[[receiving-review-verify-first]]. Reply in the inline comment thread
(`pulls/<N>/comments/<id>/replies`), not as a top-level PR comment. Push back
with evidence when a finding rests on a wrong premise; fix it when it does not.

Related: [[finish-before-pr]], [[no-ai-attribution]].
