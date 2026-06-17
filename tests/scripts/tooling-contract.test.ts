import {spawnSync} from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vitest'

const tempDirs: string[] = []

afterEach(async () => {
	await Promise.all(tempDirs.splice(0).map(dir => fs.rm(dir, {recursive: true, force: true})))
})

async function tempRoot(): Promise<string> {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-tooling-contract-'))
	tempDirs.push(root)
	return root
}

async function writeFixtureFile(root: string, filePath: string, contents: string): Promise<void> {
	const fullPath = path.join(root, filePath)
	await fs.mkdir(path.dirname(fullPath), {recursive: true})
	await fs.writeFile(fullPath, contents)
}

function packageJson(options: {lintStaged?: Record<string, string>} = {}): string {
	return `${JSON.stringify(
		{
			private: true,
			packageManager: 'bun@1.2.23',
			workspaces: [],
			scripts: {
				'lint:prepare': 'bun run errors:build',
				lint: 'bun run lint:prepare && oxlint --type-aware .',
				'check:tooling-parity': 'node scripts/check-tooling-parity.mjs',
				'check:tooling-contract': 'node scripts/check-tooling-contract.mjs',
				'packages:verify-metadata': 'node scripts/check-package-publish-metadata.mjs',
				check: 'bun run check:tooling-parity && bun run check:tooling-contract && bun run packages:check',
				'packages:check': 'bun run errors:check && bun run bridge:check && bun run packages:verify-metadata'
			},
			'lint-staged': options.lintStaged ?? {'*.{ts,tsx,cts,mts,js,mjs,cjs,json,jsonc,css}': 'biome format --write --no-errors-on-unmatched', '*.{ts,tsx,cts,mts,js,mjs,cjs}': 'bash -lc \'bun run lint:prepare && oxlint --fix --deny-warnings "$@"\' --'}
		},
		null,
		'\t'
	)}\n`
}

function publishWorkflow(command: string): string {
	return `permissions:\n  id-token: write\nsteps:\n  - uses: actions/setup-node@v6\n    with:\n      node-version: 24\n      registry-url: https://registry.npmjs.org\n      package-manager-cache: false\n  - run: ${command}\n  - run: bun pm view\n  - run: bun pm pack --destination npm-artifacts\n  run: npm publish ./npm-artifacts/*.tgz --access public\n`
}

async function createContractFixture(overrides: {gitignore?: string; mise?: string; lintStaged?: Record<string, string>} = {}): Promise<string> {
	const root = await tempRoot()
	await Promise.all([
		writeFixtureFile(root, 'package.json', packageJson({lintStaged: overrides.lintStaged})),
		writeFixtureFile(root, 'biome.jsonc', '{"formatter":{"enabled":true},"linter":{"enabled":false},"assist":{"enabled":false},"files":{"includes":[]}}\n'),
		writeFixtureFile(root, 'knip.json', '{"workspaces":{}}\n'),
		writeFixtureFile(root, '.node-version', '24.16.0\n'),
		writeFixtureFile(root, 'mise.toml', overrides.mise ?? '[tools]\nnode = "24.16.0"\nbun = "1.2.23"\n'),
		writeFixtureFile(root, '.gitignore', overrides.gitignore ?? 'mise.local.toml\n.mise.local.toml\n.playwright-browsers/\n'),
		writeFixtureFile(root, '.github/workflows/ci.yml', 'steps:\n  - run: bun run check\n'),
		writeFixtureFile(root, '.github/workflows/publish-ytdlp-errors.yml', publishWorkflow('bun run errors:check')),
		writeFixtureFile(root, '.github/workflows/publish-yt-dlp-bridge.yml', publishWorkflow('bun run bridge:check'))
	])
	return root
}

function runToolingContract(root: string): {output: string; status: number | null} {
	const script = path.join(process.cwd(), 'scripts/check-tooling-contract.mjs')
	const result = spawnSync(process.execPath, [script, '--root', root], {encoding: 'utf8'})
	return {status: result.status, output: `${result.stdout}${result.stderr}`}
}

describe('tooling contract', () => {
	it('passes a valid tooling contract fixture', async () => {
		const root = await createContractFixture()

		const result = runToolingContract(root)

		expect(result.status).toBe(0)
	})

	it('only accepts Node and Bun pins from the mise tools table', async () => {
		const root = await createContractFixture({mise: '[tools]\nnode = "24.16.0" # keep in sync with .node-version\nbun = "1.2.23" # keep in sync with packageManager\n\n[env]\nnode = "24.15.0"\nbun = "1.2.22"\n'})

		const result = runToolingContract(root)

		expect(result.status).toBe(0)
	})

	it('fails when mise tool pins drift from the canonical Node and Bun pins', async () => {
		const root = await createContractFixture({mise: '[tools]\nnode = "24.15.0"\nbun = "1.2.22"\n'})

		const result = runToolingContract(root)

		expect(result.status).toBe(1)
		expect(result.output).toContain('mise.toml node must match .node-version')
		expect(result.output).toContain('mise.toml bun must match packageManager')
	})

	it('fails when local tool override and browser-cache ignores are missing', async () => {
		const root = await createContractFixture({gitignore: 'node_modules/\n'})

		const result = runToolingContract(root)

		expect(result.status).toBe(1)
		expect(result.output).toContain('.gitignore must ignore mise.local.toml')
		expect(result.output).toContain('.gitignore must ignore .mise.local.toml')
		expect(result.output).toContain('.gitignore must ignore .playwright-browsers/')
	})

	it('requires lint-staged Biome formatting to tolerate ignored staged files', async () => {
		const root = await createContractFixture({lintStaged: {'*.{ts,tsx,cts,mts,js,mjs,cjs,json,jsonc,css}': 'biome format --write', '*.{ts,tsx,cts,mts,js,mjs,cjs}': 'bash -lc \'bun run lint:prepare && oxlint --fix --deny-warnings "$@"\' --'}})

		const result = runToolingContract(root)

		expect(result.status).toBe(1)
		expect(result.output).toContain('lint-staged Biome command must tolerate staged files ignored by Biome config')
	})
})
