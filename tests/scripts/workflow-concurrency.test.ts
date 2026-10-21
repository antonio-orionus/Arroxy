// A pull request cancels its superseded runs, but a run on `main` never is: the
// release script tags a `release: X` commit only once that commit's required
// checks passed, and a cancelled run leaves the commit without a verdict. Each
// push therefore gets its own concurrency group, so main runs neither cancel
// nor queue behind each other.

import {readdirSync, readFileSync} from 'node:fs'
import yaml from 'js-yaml'
import {describe, expect, it} from 'vite-plus/test'

const WORKFLOW_DIR = '.github/workflows'

const PR_ONLY_CANCEL = "${{ github.event_name == 'pull_request' }}"
const PER_COMMIT_GROUP_SUFFIX = "${{ github.event_name != 'pull_request' && format('-{0}', github.sha) || '' }}"

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function workflowConcurrency(file: string): Record<string, unknown> | undefined {
	const doc = yaml.load(readFileSync(`${WORKFLOW_DIR}/${file}`, 'utf8'))
	if (!isRecord(doc)) throw new Error(`${file} is not a mapping`)
	return isRecord(doc.concurrency) ? doc.concurrency : undefined
}

const workflows = readdirSync(WORKFLOW_DIR).filter(file => file.endsWith('.yml'))
// Every workflow with a top-level group that is not serialized on purpose.
const cancelling = workflows.filter(file => {
	const concurrency = workflowConcurrency(file)
	return concurrency !== undefined && concurrency['cancel-in-progress'] !== false
})

describe('workflow concurrency', () => {
	it('finds the suites that run on pull requests and on main', () => {
		expect(cancelling).toEqual(expect.arrayContaining(['ci.yml', 'dev-smoke.yml', 'e2e-cold-start.yml', 'e2e-fixtures.yml', 'ffmpeg-remux-matrix.yml', 'installer-smoke.yml']))
	})

	it.each(cancelling)('%s cancels superseded runs on pull requests only', file => {
		expect(workflowConcurrency(file)?.['cancel-in-progress']).toBe(PR_ONLY_CANCEL)
	})

	it.each(cancelling)('%s gives every push its own group', file => {
		const group = workflowConcurrency(file)?.group
		expect(group).toBe(`\${{ github.workflow }}-\${{ github.event_name }}-\${{ github.ref }}${PER_COMMIT_GROUP_SUFFIX}`)
	})

	it('leaves the publish workflows serialized and never cancelled', () => {
		for (const file of ['publish-yt-dlp-bridge.yml', 'publish-ytdlp-errors.yml', 'runtime-binaries.yml']) {
			expect(workflowConcurrency(file)?.['cancel-in-progress']).toBe(false)
		}
	})
})
