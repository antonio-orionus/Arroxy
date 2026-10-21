// Review and verification prompts. The bar is "a bug the author would fix if
// they knew": precise enough to act on, loose enough to report edge cases that
// need particular inputs, which is where a download pipeline breaks.

export interface ReviewScope {
	mergeBase: string
	head: string
	commits: string
	files: string
	learnings: string
}

export interface Lane {
	id: string
	focus: string
}

// Claude reviews in narrow lanes, Codex reviews the whole change at once, so the
// two tools find bugs from different angles. When Codex is unavailable, a light
// run puts the whole-change lane on Claude instead. What is out of scope, security
// hardening among it, lives in review-learnings.md, which every prompt includes.
export const CLAUDE_LANES: readonly Lane[] = [
	{
		id: 'regressions',
		focus: `Regressions and broken contracts.
- Behaviour the change alters that its intent (commit messages) does not ask for.
- Edge, empty, retry, cancel and fallback paths the new code mishandles.
- Callers and callees that disagree after the change: changed return shapes, new states a switch does not handle, IPC payloads the other side does not expect.
- Flows that should have changed together but did not (the same rule implemented twice, one copy updated).
- Ordering, races, stale state and missing cleanup: queue jobs, pause/resume/cancel, timers, listeners, child processes, files left behind.`
	},
	{
		id: 'failures',
		focus: `Silent failures.
- Errors swallowed by catch blocks, \`.catch(() => null)\` or optional chaining that erase a distinction the caller needs.
- Fallbacks that hide a real problem from the user or the log, and defaults that make a failure look like success.
- A user-facing failure with no message, or a message that blames the wrong thing.
- Logs that report the wrong value, or no log where an operator would need one to diagnose a failure.`
	},
	{
		id: 'types-and-rules',
		focus: `Type design and this repository's documented rules.
- Data crossing a trust boundary (IPC, persistence, child-process output, network, settings) consumed without an owned parser, \`any\`, or an assertion with no visible check.
- Illegal states the new types make representable, invariants left to comments, unions handled non-exhaustively.
- Breaches of AGENTS.md (the root file and any in the changed folders), GLOSSARY.md terms, DESIGN.md rules: enums outside schemas.ts, UI primitives hand-rolled where shadcn has one, copy not going through i18n keys, dependencies pointing outward.
Quote the rule a finding rests on.`
	},
	{
		id: 'tests',
		focus: `Tests.
- Changed behaviour with no test at the layer that owns it (dev-docs/fixture-e2e.md, "Choosing the right test"). This repository is test-first, so a behaviour change without a test is a finding.
- Tests that cannot fail, assert implementation details instead of behaviour, or depend on timing, order or the network.
- Mocks that no longer match the real interface they stand in for.`
	}
]

export const WHOLE_CHANGE_LANE: Lane = {
	id: 'review',
	focus: `The whole change: correctness, regressions, broken contracts between callers and callees, races and cleanup, silent failures, type-safety holes at trust boundaries, breaches of the repository's documented rules (AGENTS.md at the root and in changed folders, GLOSSARY.md, DESIGN.md), and behaviour changes that have no test.`
}

const SHARED_RULES = `What counts as a finding:
- A discrete, actionable defect the author would fix if they knew about it.
- You can state the failure: which input or state, what goes wrong, what the user or the code sees. Put that in the body.
- If the claim depends on code outside the diff, you read that code. Never assume a helper, guard or caller behaves some way; open it. Use codegraph_explore when it is available to find callers.
- A bug that needs particular inputs still counts: name the inputs.

Do not report:
- Style, naming, formatting, comment wording, or anything oxlint, the TypeScript compiler, knip or \`bun run check\` would already catch.
- Generated files: README.md at the root and docs/readme/README.*.md, non-English locale JSON and .po files.
- Speculation that something "may break" elsewhere without naming the code that breaks.
- Suggestions to add docstrings, logging for its own sake, or more defensive checks on values that are already validated.

Pre-existing bugs: report one only if it is in or next to the code this change touches, and set "introduced" to false. Set it to true only when this change created or exposed the defect.

Severity: P0 breaks a main workflow for everyone or loses data; P1 breaks a real workflow under common conditions; P2 wrong under specific conditions; P3 minor. Confidence is your probability, 0 to 1, that the defect is real.

Report every qualifying finding, not just the first. If nothing qualifies, return an empty list; do not invent findings to fill it. Keep each body to one short paragraph. Line numbers refer to the file at HEAD.`

function scopeBlock(scope: ReviewScope): string {
	return `Change under review: \`git diff ${scope.mergeBase}...${scope.head}\` in this repository. Read the diff yourself, then read every changed file in full around each hunk.

Commits (their messages state the intent):
${scope.commits}

Changed files:
${scope.files}`
}

function learningsBlock(learnings: string): string {
	return learnings.trim() === '' ? '' : `\n\nLessons from earlier reviews in this repository (they override the rules above where they conflict):\n${learnings.trim()}`
}

export function reviewPrompt(scope: ReviewScope, lane: Lane): string {
	return `You are reviewing a code change in Arroxy, an Electron desktop app (main, preload and renderer processes) that downloads media through yt-dlp. You are read-only: do not edit files, stage, commit or run anything that changes the workspace.

${scopeBlock(scope)}

Your focus:
${lane.focus}

${SHARED_RULES}${learningsBlock(scope.learnings)}

Return JSON matching the provided schema.`
}

// `selfCheck`: the findings came from an earlier Claude pass, because Codex is
// unavailable. The same model shares the first pass's blind spots, so the prompt
// tells the checker not to inherit its reasoning.
export function verifyPrompt(scope: ReviewScope, findingsJson: string, selfCheck: boolean): string {
	const author = selfCheck ? 'An earlier pass by the same model as you (so it may share your blind spots; do not trust its reasoning, re-derive each claim from the code yourself)' : 'Another reviewer'
	return `${author} found the defects below in a code change in Arroxy, an Electron desktop app. Your job is to check each one independently against the code. You are read-only: do not edit files, stage, commit or run anything that changes the workspace.

${scopeBlock(scope)}

Findings to check (JSON, one entry per id):
${findingsJson}

For each id, open the cited code and the code it depends on, and try to disprove the claim:
- "confirmed": you traced the failure scenario through the actual code and it happens.
- "refuted": the premise is wrong: a guard, caller, type, test or earlier step prevents it, the cited code does not do what the finding says, or it is out of scope (style, something the linter or compiler catches, or a lesson below that rules it out).
- "uncertain": it depends on runtime behaviour you cannot establish from the code (a yt-dlp or OS behaviour, timing) and you could not settle it.
Be skeptical: a plausible story is not a confirmation. The reason is one or two sentences citing the code that decided it.
Also set "introduced": true only if this change created or exposed the defect, false if it predates the change.${learningsBlock(scope.learnings)}

Return JSON matching the provided schema with exactly one verdict per id.`
}
