import {spawnSync} from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vite-plus/test'

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

const STAGED_FORMAT_PATTERN = '*.{json,jsonc,css}'
const STAGED_CODE_PATTERN = '*.{ts,tsx,cts,mts,js,mjs,cjs}'
const VALID_STAGED = {[STAGED_FORMAT_PATTERN]: 'vp fmt --no-error-on-unmatched-pattern', [STAGED_CODE_PATTERN]: 'bash -lc \'bun run errors:build; vp fmt "$@"; vp lint --fix --deny-warnings "$@"\' --'}

function packageJson(options: {devDependencies?: Record<string, string>; packagesCheck?: string} = {}): string {
	return `${JSON.stringify(
		{
			private: true,
			type: 'module',
			packageManager: 'bun@1.2.23',
			workspaces: [],
			devDependencies: options.devDependencies ?? {'vite-plus': '1.1.0', '@oxlint/plugins': '1.78.0', oxlint: '1.78.0', 'oxlint-tsgolint': '7.0.1'},
			scripts: {
				prepare: 'vp config --no-agent',
				'check:static': 'bun run errors:build && vp check',
				build: 'bun run errors:build && vp check --no-fmt --no-lint && electron-vite build',
				'check:tooling-parity': 'node scripts/check-tooling-parity.mjs',
				'check:tooling-contract': 'node scripts/check-tooling-contract.mjs',
				'packages:verify-metadata': 'node scripts/check-package-publish-metadata.mjs',
				check: 'vp run quality-gate',
				'packages:check': options.packagesCheck ?? 'bun run errors:check && bun run bridge:check && bun run control:check && bun run packages:verify-metadata'
			}
		},
		null,
		'\t'
	)}\n`
}

function viteConfig(options: {staged?: Record<string, string>; lintOptions?: Record<string, unknown>; noCycle?: unknown} = {}): string {
	const config = {
		fmt: {ignorePatterns: ['dist/**']},
		lint: {options: options.lintOptions ?? {typeAware: true, typeCheck: true}, overrides: [{files: ['src/**/*.ts'], rules: {'import/no-cycle': options.noCycle ?? ['error', {ignoreTypes: false}]}}]},
		run: {tasks: {'quality-gate': {command: 'bun run packages:check', dependsOn: ['check:static', 'check:tooling-parity', 'check:tooling-contract'], cache: false}}},
		staged: options.staged ?? VALID_STAGED
	}
	return `export default ${JSON.stringify(config, null, '\t')}\n`
}

function publishWorkflow(command: string): string {
	return `permissions:\n  id-token: write\nsteps:\n  - uses: actions/setup-node@v6\n    with:\n      node-version: 24\n      registry-url: https://registry.npmjs.org\n      package-manager-cache: false\n  - run: ${command}\n  - run: bun pm view\n  - run: bun pm pack --destination npm-artifacts\n  run: npm publish ./npm-artifacts/*.tgz --access public\n`
}

async function createContractFixture(overrides: {gitignore?: string; mise?: string; staged?: Record<string, string>; lintOptions?: Record<string, unknown>; noCycle?: unknown; devDependencies?: Record<string, string>; bundledOxlint?: string; packagesCheck?: string} = {}): Promise<string> {
	const root = await tempRoot()
	await Promise.all([
		writeFixtureFile(root, 'package.json', packageJson({devDependencies: overrides.devDependencies, packagesCheck: overrides.packagesCheck})),
		writeFixtureFile(root, 'vite.config.ts', viteConfig({staged: overrides.staged, lintOptions: overrides.lintOptions, noCycle: overrides.noCycle})),
		writeFixtureFile(root, 'node_modules/vite-plus/package.json', JSON.stringify({name: 'vite-plus', dependencies: {oxlint: overrides.bundledOxlint ?? '=1.78.0', 'oxlint-tsgolint': '=7.0.1'}})),
		writeFixtureFile(root, '.vite-hooks/pre-commit', 'vp staged\n\nbun scripts/check-commit-fallout.ts\n'),
		writeFixtureFile(root, 'knip.json', '{"workspaces":{}}\n'),
		writeFixtureFile(root, '.node-version', '24.16.0\n'),
		writeFixtureFile(root, 'mise.toml', overrides.mise ?? '[tools]\nnode = "24.16.0"\nbun = "1.2.23"\n'),
		writeFixtureFile(root, '.gitignore', overrides.gitignore ?? 'mise.local.toml\n.mise.local.toml\n.playwright-browsers/\n'),
		writeFixtureFile(root, '.github/workflows/ci.yml', 'steps:\n  - run: bun run check\n'),
		writeFixtureFile(root, '.github/workflows/publish-ytdlp-errors.yml', publishWorkflow('bun run errors:check')),
		writeFixtureFile(root, '.github/workflows/publish-yt-dlp-bridge.yml', publishWorkflow('bun run bridge:check')),
		writeFixtureFile(root, '.github/workflows/publish-arroxy-control.yml', publishWorkflow('bun run control:check'))
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

	it('fails when packages:check skips the arroxy-control gate', async () => {
		const root = await createContractFixture({packagesCheck: 'bun run errors:check && bun run bridge:check && bun run packages:verify-metadata'})

		const result = runToolingContract(root)

		expect(result.status).toBe(1)
		expect(result.output).toContain('packages:check must run errors:check, bridge:check and control:check, then packages:verify-metadata.')
	})

	it('fails when the arroxy-control publish workflow skips its gate', async () => {
		const root = await createContractFixture()
		await writeFixtureFile(root, '.github/workflows/publish-arroxy-control.yml', publishWorkflow('bun run errors:check'))

		const result = runToolingContract(root)

		expect(result.status).toBe(1)
		expect(result.output).toContain('publish-arroxy-control.yml must call "bun run control:check"')
	})

	it('fails when the plugin bridge drifts from the oxlint version vite-plus bundles', async () => {
		const root = await createContractFixture({bundledOxlint: '=1.79.0'})

		const result = runToolingContract(root)

		expect(result.status).toBe(1)
		expect(result.output).toContain('@oxlint/plugins must use the exact oxlint version bundled by vite-plus')
	})

	it('requires the lint binaries vp resolves to be pinned to the bundled versions', async () => {
		const root = await createContractFixture({devDependencies: {'vite-plus': '1.1.0', '@oxlint/plugins': '1.78.0', oxlint: '1.77.0'}})

		const result = runToolingContract(root)

		expect(result.status).toBe(1)
		expect(result.output).toContain('must pin oxlint to the exact version vite-plus bundles (1.78.0)')
		expect(result.output).toContain('must pin oxlint-tsgolint to the exact version vite-plus bundles (7.0.1)')
	})

	it('fails when a replaced standalone tool comes back', async () => {
		const root = await createContractFixture({devDependencies: {'vite-plus': '1.1.0', '@oxlint/plugins': '1.78.0', oxlint: '1.78.0', 'oxlint-tsgolint': '7.0.1', '@biomejs/biome': '2.5.15'}})
		await writeFixtureFile(root, 'biome.jsonc', '{}\n')

		const result = runToolingContract(root)

		expect(result.status).toBe(1)
		expect(result.output).toContain('Root devDependencies must not include @biomejs/biome')
		expect(result.output).toContain('biome.jsonc must not exist')
	})

	it('keeps type checking inside vp check', async () => {
		const root = await createContractFixture({lintOptions: {typeAware: true}})

		const result = runToolingContract(root)

		expect(result.status).toBe(1)
		expect(result.output).toContain('lint.options.typeCheck must stay on')
	})

	it('requires import/no-cycle to cover type-only cycles', async () => {
		const root = await createContractFixture({noCycle: 'error'})

		const result = runToolingContract(root)

		expect(result.status).toBe(1)
		expect(result.output).toContain('import/no-cycle as an error with ignoreTypes: false')
	})

	it('rejects staged rules that edit the same code file in parallel', async () => {
		const root = await createContractFixture({staged: {...VALID_STAGED, '*.{ts,tsx,json}': 'vp fmt --no-error-on-unmatched-pattern'}})

		const result = runToolingContract(root)

		expect(result.status).toBe(1)
		expect(result.output).toContain('Staged patterns must not overlap the code pattern')
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

	it('requires staged formatting to tolerate ignored staged files', async () => {
		const root = await createContractFixture({staged: {...VALID_STAGED, [STAGED_FORMAT_PATTERN]: 'vp fmt'}})

		const result = runToolingContract(root)

		expect(result.status).toBe(1)
		expect(result.output).toContain('Staged vp fmt command must tolerate staged files ignored by the fmt config')
	})
})
