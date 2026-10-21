import {readFileSync} from 'node:fs'
import path from 'node:path'

import {describe, expect, it} from 'vite-plus/test'

import {CLAUDE_LANES, WHOLE_CHANGE_LANE, reviewPrompt, verifyPrompt, type ReviewScope} from '../../scripts/dual-review/prompts.js'

// Out-of-scope rules have one home, review-learnings.md: every prompt pastes it
// in, and CodeRabbit reads it as a code guideline. A copy in the prompt itself
// drifts from it.
const LEARNINGS = readFileSync(path.resolve(import.meta.dirname, '../../.agents/memory/review-learnings.md'), 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '')
const SCOPE: ReviewScope = {mergeBase: 'abc', head: 'def', commits: '- def a change', files: ' a.ts | 1 +', learnings: LEARNINGS}

const mentionsSecurity = (text: string): number => text.match(/security hardening/gi)?.length ?? 0

describe('dual review prompts', () => {
	it('carry the security scope rule only through the learnings file', () => {
		expect(mentionsSecurity(LEARNINGS)).toBe(1)
		for (const lane of [WHOLE_CHANGE_LANE, ...CLAUDE_LANES]) expect(mentionsSecurity(reviewPrompt(SCOPE, lane))).toBe(1)
		expect(mentionsSecurity(verifyPrompt(SCOPE, '[]', false))).toBe(1)
		expect(mentionsSecurity(verifyPrompt(SCOPE, '[]', true))).toBe(1)
	})
})
