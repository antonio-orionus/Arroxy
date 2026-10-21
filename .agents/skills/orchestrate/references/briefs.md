# Brief and message templates

These templates are filled in from the briefs that worked in the 2026-10-20/21 round. Replace every `<…>` with specifics: `file:line`, PR numbers, the names of the files to avoid. A brief with vague paths sends the session off to search for them again.

## Shared `background` (every fresh session)

```text
Arroxy (Electron app, Bun monorepo). An orchestrating session dispatches these fixes and owns the
private `.internal/` backlogs. <Why this batch exists: e.g. "Antonio warns these audit findings are
unverified">. In flight right now, so avoid these files unless necessary: <#PR: files>. Rules: never
edit `.internal/` yourself; report any out-of-scope bug in your final message; no AI attribution.
Goal is <merge | a published package>, not an Arroxy release; don't stop to ask before pushing.
```

## Verify, then land (one bug candidate)

```text
UNVERIFIED bug candidate. Verify it first, and land a fix only if it's real.

Candidate: `<file:line>`. <What breaks, for whom, in one or two sentences>.

Step 1 (verify): <how to reproduce at the layer that owns it: a failing unit test, a fixture E2E
for a user workflow, N loop runs for a flake (e.g. 60 alone and 40 under load)>. If the code already
handles it, or the path can't fail like that, stop: no PR, report the evidence.
Step 2 (if confirmed): land it (`land` skill: test-first, dual review, PR, CodeRabbit per budget,
auto-merge). <Preferred shape of the fix, e.g. a soft-fail notice that mirrors how subtitle
soft-fails surface, not a hard failure>. New user-facing copy: send the English to the orchestrator
for approval before you translate.

Final message: confirmed and fixed (PR link and merge state), or not a bug (the evidence), plus any
other out-of-scope bug you noticed.
```

Two candidates in the same files go in one brief, numbered, with "verify each, fix only what's real" and one PR each unless the two can't be green apart.

## Lane (a sequence of PRs from an approved design)

```text
Read <design doc §§> and <ADR> on main first. They are the spec. You own <N> PRs in sequence, each
branched from main and each landed with the `land` skill.

- **<Step id>** (<app refactor | bridge feature | behaviour>, <--light | full review + CodeRabbit>;
  after <step or PR>): <what it does>; <what it absorbs from the backlog>.
- ...

Cross-lane order: <step> waits for <other lane's step>. Park a background wait on its PR
(`gh pr list --head <branch>` finds it), then branch from main once it has merged. Bridge PRs run
one at a time across lanes. Don't tag or publish packages: the orchestrator does.
Report at the end, or when blocked: PR links and merge state, copy that needs approval, whether a
package release is due, and any out-of-scope bug you noticed.
```

## Design (a patch cluster)

```text
Architecture investigation and design. Write NO production code in this session. Load the
`codebase-design` and `domain-modeling` skills first.

Why: in the last 60 days main took <N> fixes in <area> and <M> in <area>, and they keep arriving
one path at a time: <the duplicated routes, with PR numbers>.

Do:
1. Map each area completely (codegraph first): every route by which <the decision> is made, from
   <entry> through <layers>. Back the map with `git log` evidence: which fixes landed where, and
   which routes each fix missed.
2. Find the missing seam. Propose one deep module per area that owns the decision: its interface,
   its ownership, what gets deleted, and how a test pins every route. Check the proposal against
   upstream source wherever it mirrors upstream behaviour.
3. Give a PR sequence that follows AGENTS.md (one concern per PR, no stacking, package changes
   separate, behaviour-free refactors first). For each PR, list the backlog bugs it absorbs.
4. Draft an ADR for each decision that is hard to reverse, and list the decisions Antonio must make,
   each with a recommendation.

Output: `.internal/<design-doc>.md` (a new file, the one exception to the no-`.internal` rule; don't
run `internal:save`). Draft ADRs stay uncommitted in your worktree. Final message: at most 15 lines
covering the seams, the PR sequence, and which in-flight work should pause.
```

## Publish a dependency

```text
Publish `<pkg>` <version> to npm. The package only, NEVER an Arroxy app release.
<If it waits on a fix: first park a background wait until PR #N has merged.>
1. On a branch from main, read the CHANGELOG and the commits since tag `<pkg>-v<last>`. Choose the
   version (in 0.x, an argv or behaviour change is a minor bump) and write one coherent changelog
   section. Bump `package.json` (and `bun.lock` as #359 did), run `bun run <errors|bridge>:check`
   and `bun run check`, then land it as a light PR titled `release(packages): <pkg> <version>` with
   auto-merge.
2. After the merge: `git tag -a <pkg>-v<version> -m "<pkg> <version>" <merge-sha>`, then push that
   tag alone. Watch the publish workflow once (`gh run watch`), then confirm
   `bun pm view <pkg> version`.
Never re-tag or move a published tag. Final message: the PR, the tag, the workflow run and the npm
version.
```

## Guard after an incident

```text
Incident to guard against: <what happened, the commit and the repair PR>. Root cause: <from the
session that caused it>. Build these guards test-first and land them as one tooling PR (one
concern: "<the invariant>"): <each guard, with the exact check and where it lives>. Reproduce the
incident in a temp repo inside the test. Record the rule in `.agents/memory/` and in the skill it
belongs to, then run `bun run agents:sync`.
```

## Retro review (after a degraded review period)

```text
Read-only. These PRs merged while <reviewer> was out: <#list>. Run <reviewer> over them in chunks
small enough to finish (close stdin, put a timeout on each chunk, run them in the background). Then
check every finding against current main yourself: confirmed (with the scenario and `file:line`),
or rejected (with the reason). No fixes and no PRs. Final message: the confirmed findings with
severity, plus the rejected ones with reasons.
```

## Messages to running sessions (`SendMessage`, id `local_…`)

- **Queued follow-up:** "Follow-up for after your current PR merges: <candidate>. Don't add it to your current PR. It comes to you because you're already in `<file>`. Verify it first."
- **Hold:** "HOLD: don't open or merge the PR for <x> yet. Keep the branch pushed and intact. <The design that may absorb it>."
- **Retire and harvest:** "Don't open a PR for <branch>. <Decision> makes it step <id> of the redesign. Push the branch as it is, including <the test>, which <lane> will reuse."
- **Hand a lane its inputs:** "For <step>, here are the inputs from the retired branch `<branch>`, head `<sha>`: read them with `git show origin/<branch>:<path>`. <The lesson its review learned>."
- **Resume after a quit or an outage:** "Resume your task: <what it was doing>. Background shells, dev servers and waits from before the <quit/outage> are gone, so re-run <what>, then carry on as briefed."
- **Environment change:** one message per session, written for its own state. Example: "Codex is back. Your open PR #N was reviewed without it, so run one `review:dual` round on its current head before auto-merge takes it."
- **Red main:** "`main` is red because <cause>, not your change. The fix is #N. Park a wait on it, then run `gh pr update-branch <yours>` so your gates re-run, and auto-merge does the rest."
- **Answer a question:** the decision first, then its reason in one sentence, then exactly what to do next.
