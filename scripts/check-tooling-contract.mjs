#!/usr/bin/env node
import {existsSync, readFileSync, readdirSync} from 'node:fs'
import {basename, dirname, join, relative, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

const DEFAULT_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const REQUIRED_PACKAGE_SCRIPTS = ['typecheck', 'test', 'build', 'prepack', 'pack:dry-run']
const PUBLISH_DEPENDENCY_SECTIONS = ['dependencies', 'peerDependencies', 'optionalDependencies']
const ROOT_DEPENDENCY_SECTIONS = ['dependencies', 'devDependencies', 'optionalDependencies']
const PACKAGE_TOOLING_CONFIG_PATTERNS = [/^\.oxlintrc(?:\..*)?$/, /^\.oxfmtrc(?:\..*)?$/, /^oxlint\.config\./, /^eslint\.config\./, /^\.eslintrc(?:\..*)?$/, /^biome\.jsonc?$/, /^\.prettierrc(?:\..*)?$/, /^prettier\.config\./]
const COMMAND_SCAN_ROOTS = ['package.json', 'AGENTS.md', 'CONTRIBUTING.md', 'dev-docs', 'scripts', '.github', 'packages']
const COMMAND_SCAN_FILE_EXTENSIONS = new Set(['.json', '.jsonc', '.md', '.mjs', '.js', '.ts', '.tsx', '.mts', '.cts', '.yml', '.yaml', '.sh', '.ps1'])
const REQUIRED_GITIGNORE_ENTRIES = ['mise.local.toml', '.mise.local.toml', '.playwright-browsers/']
// Vite+ owns formatting, linting, tests, packaging, staged checks and hooks.
// These standalone configs and packages must not come back next to it.
const REPLACED_ROOT_CONFIGS = ['biome.json', 'biome.jsonc', '.oxlintrc.json', '.oxfmtrc.json', '.lintstagedrc', '.lintstagedrc.json', '.husky/pre-commit', 'vitest.config.ts', 'vitest.config.mts', 'tsup.config.ts', 'tsdown.config.ts']
const REPLACED_DEV_DEPENDENCIES = ['@biomejs/biome', 'oxfmt', 'husky', 'lint-staged', 'concurrently', 'tsup', 'tsdown']
const STAGED_FORMAT_PATTERN = '*.{json,jsonc,css}'
const STAGED_CODE_PATTERN = '*.{ts,tsx,cts,mts,js,mjs,cjs}'
const STATIC_CHECK_SCRIPT = 'bun run errors:build && vp check'
const QUALITY_GATE_TASK = 'quality-gate'
const NPM_CLI_NAME = 'np' + 'm'
const NPX_CLI_NAME = 'np' + 'x'
const NPM_FAMILY_COMMAND_PATTERN = new RegExp(String.raw`\b(?:${NPM_CLI_NAME}|${NPX_CLI_NAME})[ \t]+`)
const TRUSTED_NPM_PUBLISH_COMMAND = `${NPM_CLI_NAME} publish ./npm-artifacts/*.tgz --access public`
const TRUSTED_NPM_PUBLISH_WORKFLOWS = new Set(['.github/workflows/publish-ytdlp-errors.yml', '.github/workflows/publish-yt-dlp-bridge.yml', '.github/workflows/publish-arroxy-control.yml'])

function rootFromArgs(argv) {
	const rootIndex = argv.indexOf('--root')
	if (rootIndex === -1) return DEFAULT_ROOT
	const root = argv[rootIndex + 1]
	if (!root) throw new Error('--root requires a path')
	return resolve(root)
}

const repoRoot = rootFromArgs(process.argv.slice(2))

function repoPath(path) {
	return join(repoRoot, path)
}

function posix(path) {
	return path.replaceAll('\\', '/')
}

function display(path) {
	return posix(relative(repoRoot, path))
}

function readJson(path) {
	return JSON.parse(readFileSync(repoPath(path), 'utf8'))
}

function readText(path) {
	return readFileSync(repoPath(path), 'utf8')
}

// import/no-cycle skips type-only imports by default; a type-only cycle is
// still a cycle, so the rule must run as an error with ignoreTypes: false.
function isStrictNoCycle(setting) {
	if (!Array.isArray(setting)) return false
	const [severity, options] = setting
	return severity === 'error' && isObject(options) && options.ignoreTypes === false
}

async function importConfig(path) {
	const module = await import(pathToFileURL(repoPath(path)).href)
	return isObject(module.default) ? module.default : {}
}

function exactVersion(spec) {
	return typeof spec === 'string' ? spec.replace(/^=/, '') : undefined
}

function isObject(value) {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringMap(value) {
	return isObject(value) ? value : {}
}

function fail(message) {
	failures.push(message)
}

function assert(condition, message) {
	if (!condition) fail(message)
}

function packageDirsFromWorkspaces(workspaces) {
	const dirs = []
	for (const workspace of workspaces) {
		if (workspace.endsWith('/*')) {
			const base = workspace.slice(0, -2)
			const absBase = repoPath(base)
			if (!existsSync(absBase)) continue
			for (const entry of readdirSync(absBase, {withFileTypes: true})) {
				if (!entry.isDirectory()) continue
				const dir = `${base}/${entry.name}`
				if (existsSync(repoPath(`${dir}/package.json`))) dirs.push(dir)
			}
			continue
		}
		if (existsSync(repoPath(`${workspace}/package.json`))) dirs.push(workspace)
	}
	return [...new Set(dirs)].sort((a, b) => a.localeCompare(b))
}

function hasSourceFiles(dir) {
	const abs = repoPath(dir)
	if (!existsSync(abs)) return false
	for (const entry of readdirSync(abs, {withFileTypes: true})) {
		const child = join(abs, entry.name)
		if (entry.isDirectory()) {
			if (hasSourceFiles(display(child))) return true
			continue
		}
		if (/\.(?:ts|tsx|js|mjs|cjs|cts|mts)$/.test(entry.name)) return true
	}
	return false
}

function findPackageConfigFiles(dir) {
	const found = []
	const walk = absDir => {
		for (const entry of readdirSync(absDir, {withFileTypes: true})) {
			if (entry.name === 'node_modules' || entry.name === 'dist') continue
			const abs = join(absDir, entry.name)
			if (entry.isDirectory()) {
				walk(abs)
				continue
			}
			if (PACKAGE_TOOLING_CONFIG_PATTERNS.some(pattern => pattern.test(entry.name))) found.push(display(abs))
		}
	}
	walk(repoPath(dir))
	return found
}

function findFilesContaining(dir, needle) {
	const found = []
	const walk = absDir => {
		for (const entry of readdirSync(absDir, {withFileTypes: true})) {
			const abs = join(absDir, entry.name)
			if (entry.isDirectory()) {
				if (entry.name !== 'node_modules') walk(abs)
				continue
			}
			if (/\.(?:ts|mts|cts|js|mjs|cjs)$/.test(entry.name) && readFileSync(abs, 'utf8').includes(needle)) found.push(display(abs))
		}
	}
	walk(repoPath(dir))
	return found
}

function ignoreCoversPackage(pattern, dir) {
	const normalized = posix(pattern)
	if (normalized.startsWith('!')) return false
	const parent = dir.split('/')[0]
	return [normalized === dir, normalized.startsWith(`${dir}/`), normalized === `${parent}/**`, normalized === `${parent}/*`].some(Boolean)
}

function hasWorkspaceProtocol(spec) {
	return typeof spec === 'string' && spec.startsWith('workspace:')
}

function parseBunPackageManagerVersion(packageManager) {
	if (typeof packageManager !== 'string') return null
	const match = /^bun@(.+)$/.exec(packageManager)
	return match?.[1] ?? null
}

function parseMiseTools(text) {
	const tools = {}
	let inToolsSection = false
	for (const line of text.split(/\r?\n/)) {
		const sectionMatch = /^\s*\[([^\]]+)]\s*$/.exec(line)
		if (sectionMatch) {
			inToolsSection = sectionMatch[1] === 'tools'
			continue
		}
		if (!inToolsSection) continue
		const normalized = line.replace(/\s+#.*$/, '').trim()
		const match = /^(node|bun)\s*=\s*"([^"]+)"$/.exec(normalized)
		if (match) tools[match[1]] = match[2]
	}
	return tools
}

function gitignoreEntries(text) {
	return new Set(
		text
			.split(/\r?\n/)
			.map(line => line.trim())
			.filter(line => line.length > 0 && !line.startsWith('#'))
	)
}

function extensionFor(path) {
	const name = path.split('/').at(-1) ?? path
	const index = name.lastIndexOf('.')
	return index === -1 ? '' : name.slice(index)
}

function shouldScanCommandFile(path) {
	const normalized = posix(path)
	if (normalized.startsWith('.github/skills/')) return false
	if (normalized.includes('/node_modules/') || normalized.includes('/dist/')) return false
	if (normalized.includes('/src/generated/')) return false
	return COMMAND_SCAN_FILE_EXTENSIONS.has(extensionFor(normalized))
}

function isAllowedNpmFamilyCommand(path, line) {
	return TRUSTED_NPM_PUBLISH_WORKFLOWS.has(path) && line.trim() === `run: ${TRUSTED_NPM_PUBLISH_COMMAND}`
}

function findNpmFamilyCommands() {
	const matches = []
	const scan = absPath => {
		const normalized = display(absPath)
		if (normalized.startsWith('.github/skills/')) return
		const entries = readdirSync(absPath, {withFileTypes: true})
		for (const entry of entries) {
			const child = join(absPath, entry.name)
			const childDisplay = display(child)
			if (entry.isDirectory()) {
				if (entry.name === 'node_modules' || entry.name === 'dist') continue
				if (entry.name === 'generated' && childDisplay.includes('/src/generated')) continue
				if (childDisplay.startsWith('.github/skills/')) continue
				scan(child)
				continue
			}
			if (!shouldScanCommandFile(childDisplay)) continue
			const lines = readFileSync(child, 'utf8').split(/\r?\n/)
			for (const [index, line] of lines.entries()) {
				if (NPM_FAMILY_COMMAND_PATTERN.test(line) && !isAllowedNpmFamilyCommand(childDisplay, line)) matches.push(`${childDisplay}:${index + 1}: ${line.trim()}`)
			}
		}
	}

	for (const root of COMMAND_SCAN_ROOTS) {
		const abs = repoPath(root)
		if (!existsSync(abs)) continue
		const entry = readdirSync(dirname(abs), {withFileTypes: true}).find(candidate => candidate.name === basename(abs))
		if (!entry) continue
		if (entry.isDirectory()) scan(abs)
		if (entry.isFile() && shouldScanCommandFile(root)) {
			const lines = readText(root).split(/\r?\n/)
			for (const [index, line] of lines.entries()) {
				if (NPM_FAMILY_COMMAND_PATTERN.test(line) && !isAllowedNpmFamilyCommand(root, line)) matches.push(`${root}:${index + 1}: ${line.trim()}`)
			}
		}
	}

	return matches
}

const failures = []
const rootPackage = readJson('package.json')
const rootScripts = stringMap(rootPackage.scripts)
const rootDevDependencies = stringMap(rootPackage.devDependencies)
const vitePlusManifestPath = 'node_modules/vite-plus/package.json'
const vitePlusManifest = existsSync(repoPath(vitePlusManifestPath)) ? readJson(vitePlusManifestPath) : {}
const vitePlusDependencies = stringMap(vitePlusManifest.dependencies)
const oxlintVersion = exactVersion(vitePlusDependencies.oxlint)
const oxlintPluginsVersion = rootDevDependencies['@oxlint/plugins']
// vp resolves oxlint and oxlint-tsgolint from the working directory first, and
// Node's lookup climbs into parent directories. Pinning both in the root makes
// vp use this checkout's copy. Without the pins, a worktree nested inside
// another checkout loads that checkout's oxlint.
const PROJECT_LINT_BINARIES = ['oxlint', 'oxlint-tsgolint']
const workspaces = Array.isArray(rootPackage.workspaces) ? rootPackage.workspaces : []
const packageDirs = packageDirsFromWorkspaces(workspaces)
const packageRecords = packageDirs.map(dir => ({dir, packageJson: readJson(`${dir}/package.json`)}))
const workspacePackageNames = new Set(packageRecords.map(({packageJson}) => packageJson.name).filter(Boolean))
const viteConfig = await importConfig('vite.config.ts')
const knip = readJson('knip.json')
const nodeVersion = readText('.node-version').trim()
const bunVersion = parseBunPackageManagerVersion(rootPackage.packageManager)
const miseConfigExists = existsSync(repoPath('mise.toml'))
const miseTools = miseConfigExists ? parseMiseTools(readText('mise.toml')) : {}
const ignoredEntries = gitignoreEntries(readText('.gitignore'))
const ciWorkflow = readText('.github/workflows/ci.yml')
const publishWorkflows = [
	{path: '.github/workflows/publish-ytdlp-errors.yml', command: 'bun run errors:check'},
	{path: '.github/workflows/publish-yt-dlp-bridge.yml', command: 'bun run bridge:check'},
	{path: '.github/workflows/publish-arroxy-control.yml', command: 'bun run control:check'}
]
const fmtConfig = stringMap(viteConfig.fmt)
const fmtIgnorePatterns = Array.isArray(fmtConfig.ignorePatterns) ? fmtConfig.ignorePatterns : []
const lintConfig = stringMap(viteConfig.lint)
const lintOptions = stringMap(lintConfig.options)
const stagedConfig = stringMap(viteConfig.staged)
const qualityGate = stringMap(stringMap(stringMap(viteConfig.run).tasks)[QUALITY_GATE_TASK])
const qualityGateDependsOn = Array.isArray(qualityGate.dependsOn) ? qualityGate.dependsOn : []
const preCommitHookPath = '.vite-hooks/pre-commit'
const preCommitHook = existsSync(repoPath(preCommitHookPath)) ? readText(preCommitHookPath) : ''
const knipWorkspaces = knip.workspaces ?? {}
const noCycleFiles = (Array.isArray(lintConfig.overrides) ? lintConfig.overrides : []).filter(override => isObject(override) && isObject(override.rules) && isStrictNoCycle(override.rules['import/no-cycle'])).flatMap(override => (Array.isArray(override.files) ? override.files.map(posix) : []))

assert(rootPackage.private === true, 'Root package must stay private so workspace-only dependencies are never published from the app package.')
assert(typeof rootDevDependencies['vite-plus'] === 'string', 'Root devDependencies must include vite-plus, the toolchain authority.')
assert(typeof oxlintVersion === 'string' && oxlintVersion.length > 0, `Could not read the oxlint version bundled by vite-plus from ${vitePlusManifestPath}; run bun install.`)
assert(typeof oxlintPluginsVersion === 'string' && oxlintPluginsVersion.length > 0, 'Root devDependencies must pin @oxlint/plugins.')
assert(oxlintPluginsVersion === oxlintVersion, `@oxlint/plugins must use the exact oxlint version bundled by vite-plus (oxlint ${oxlintVersion}, @oxlint/plugins ${oxlintPluginsVersion}).`)
for (const name of PROJECT_LINT_BINARIES) {
	const bundled = exactVersion(vitePlusDependencies[name])
	assert(rootDevDependencies[name] === bundled, `Root devDependencies must pin ${name} to the exact version vite-plus bundles (${bundled}), so vp lints with this checkout's copy; got ${rootDevDependencies[name]}.`)
}
for (const name of REPLACED_DEV_DEPENDENCIES) {
	assert(rootDevDependencies[name] === undefined, `Root devDependencies must not include ${name}; Vite+ provides that tool.`)
}
for (const path of REPLACED_ROOT_CONFIGS) {
	assert(!existsSync(repoPath(path)), `${path} must not exist; its settings live in vite.config.ts.`)
}
assert(rootPackage['lint-staged'] === undefined, 'package.json must not configure lint-staged; staged rules live in the vite.config.ts staged block.')
assert(miseConfigExists, 'mise.toml must define shared Node and Bun tool versions.')
assert(miseTools.node === nodeVersion, `mise.toml node must match .node-version (${nodeVersion}).`)
assert(bunVersion !== null, 'Root packageManager must pin Bun as bun@<version>.')
assert(miseTools.bun === bunVersion, `mise.toml bun must match packageManager (${bunVersion}).`)
for (const entry of REQUIRED_GITIGNORE_ENTRIES) {
	assert(ignoredEntries.has(entry), `.gitignore must ignore ${entry}.`)
}
assert(isObject(viteConfig.fmt), 'vite.config.ts must define the fmt block (Oxfmt is the formatter authority).')
assert(isObject(viteConfig.lint), 'vite.config.ts must define the lint block (Oxlint is the lint authority).')
assert(lintOptions.typeAware === true, 'vite.config.ts lint.options.typeAware must stay enabled.')
assert(lintOptions.typeCheck === true, 'vite.config.ts lint.options.typeCheck must stay on; vp check and vp lint own type checking.')
assert(
	noCycleFiles.some(pattern => pattern.startsWith('src/')),
	'vite.config.ts lint must enable import/no-cycle as an error with ignoreTypes: false for src/.'
)
assert(rootScripts['check:static'] === STATIC_CHECK_SCRIPT, `Root check:static must run "${STATIC_CHECK_SCRIPT}" (format, lint, type check and import cycles in one pass).`)
assert((rootScripts.build ?? '').startsWith('bun run errors:build && vp check --no-fmt --no-lint && '), 'Root build must type-check with vp check --no-fmt --no-lint before bundling.')
for (const removed of ['format', 'format:check', 'lint', 'lint:prepare', 'typecheck', 'madge']) {
	assert(rootScripts[removed] === undefined, `Root script "${removed}" is covered by vp check; run vp check, vp fmt or vp lint directly.`)
}
assert(rootScripts.prepare === 'vp config --no-agent', 'Root prepare script must install the Vite+ hook dispatcher with vp config --no-agent.')
assert(preCommitHook.includes('vp staged'), `${preCommitHookPath} must run vp staged.`)
assert(preCommitHook.includes('bun scripts/check-commit-fallout.ts'), `${preCommitHookPath} must run the commit-fallout check.`)
assert(rootScripts['lint:parity'] === undefined, 'lint:parity has been renamed; use check:tooling-parity.')
assert(rootScripts['check:tooling-parity'] === 'node scripts/check-tooling-parity.mjs', 'Root scripts must expose check:tooling-parity.')
assert(rootScripts['check:tooling-contract'] === 'node scripts/check-tooling-contract.mjs', 'Root scripts must expose check:tooling-contract.')
assert(rootScripts['packages:verify-metadata'] === 'node scripts/check-package-publish-metadata.mjs', 'Root scripts must expose packages:verify-metadata.')
assert(rootScripts.check === `vp run ${QUALITY_GATE_TASK}`, `Root check must run the vite.config.ts ${QUALITY_GATE_TASK} task.`)
assert(qualityGateDependsOn.includes('check:static'), `${QUALITY_GATE_TASK} must depend on check:static.`)
assert(qualityGateDependsOn.includes('check:tooling-parity'), `${QUALITY_GATE_TASK} must depend on check:tooling-parity.`)
assert(qualityGateDependsOn.includes('check:tooling-contract'), `${QUALITY_GATE_TASK} must depend on check:tooling-contract.`)
assert(qualityGate.command === 'bun run packages:check', `${QUALITY_GATE_TASK} must finish with packages:check after its gates pass.`)
assert(qualityGate.cache === false, `${QUALITY_GATE_TASK} must not be cached; the gate always runs for real.`)
for (const gate of qualityGateDependsOn) {
	assert(typeof rootScripts[gate] === 'string', `${QUALITY_GATE_TASK} depends on "${gate}", which is not a root script.`)
}
assert(ciWorkflow.includes('run: bun run check'), 'CI workflow must call the canonical root check.')

const formatStagedCommand = typeof stagedConfig[STAGED_FORMAT_PATTERN] === 'string' ? stagedConfig[STAGED_FORMAT_PATTERN] : ''
assert(formatStagedCommand.includes('vp fmt'), 'Staged format command must run vp fmt.')
assert(formatStagedCommand.includes('--no-error-on-unmatched-pattern'), 'Staged vp fmt command must tolerate staged files ignored by the fmt config.')
const codeStagedCommand = typeof stagedConfig[STAGED_CODE_PATTERN] === 'string' ? stagedConfig[STAGED_CODE_PATTERN] : ''
assert(codeStagedCommand.includes('bun run errors:build'), 'Staged JS/TS command must build ytdlp-errors before type-aware lint.')
assert(codeStagedCommand.includes('vp fmt'), 'Staged JS/TS command must format with vp fmt.')
assert(codeStagedCommand.includes('vp lint --fix --deny-warnings'), 'Staged JS/TS command must run vp lint fixes with denied warnings (vp check cannot deny warnings).')
const overlappingStagedPatterns = Object.keys(stagedConfig).filter(pattern => pattern !== STAGED_CODE_PATTERN && /\b(?:ts|tsx|js|mjs)\b/.test(pattern))
assert(overlappingStagedPatterns.length === 0, `Staged patterns must not overlap the code pattern, or two tasks edit one file in parallel: ${overlappingStagedPatterns.join(', ')}`)

const packagesCheck = rootScripts['packages:check'] ?? ''
const errorsCheckIndex = packagesCheck.indexOf('errors:check')
const bridgeCheckIndex = packagesCheck.indexOf('bridge:check')
const controlCheckIndex = packagesCheck.indexOf('control:check')
const metadataCheckIndex = packagesCheck.indexOf('packages:verify-metadata')
assert(
	errorsCheckIndex !== -1 && bridgeCheckIndex !== -1 && controlCheckIndex !== -1 && metadataCheckIndex !== -1 && errorsCheckIndex < bridgeCheckIndex && bridgeCheckIndex < metadataCheckIndex && controlCheckIndex < metadataCheckIndex,
	'packages:check must run errors:check, bridge:check and control:check, then packages:verify-metadata.'
)

for (const workflow of publishWorkflows) {
	const text = readText(workflow.path)
	assert(text.includes(`run: ${workflow.command}`), `${workflow.path} must call "${workflow.command}".`)
	assert(text.includes('bun pm view'), `${workflow.path} must use bun pm view for registry version checks.`)
	assert(text.includes('bun pm pack --destination'), `${workflow.path} must pack artifacts with bun pm pack.`)
	// Version-agnostic on purpose: the contract cares that Node is set up for
	// trusted publishing, not which release of the action does it. Pinning the
	// major here meant every setup-node bump failed the gate.
	assert(text.includes('uses: actions/setup-node@'), `${workflow.path} must set up Node for registry trusted publishing.`)
	assert(text.includes('node-version: 24'), `${workflow.path} must use Node 24 for registry trusted publishing.`)
	assert(text.includes('registry-url: https://registry.npmjs.org'), `${workflow.path} must target the npmjs registry for trusted publishing.`)
	assert(text.includes('package-manager-cache: false'), `${workflow.path} must keep package-manager caching disabled in publish jobs.`)
	assert(text.includes('id-token: write'), `${workflow.path} must grant OIDC id-token permission for trusted publishing.`)
	assert(text.includes(`run: ${TRUSTED_NPM_PUBLISH_COMMAND}`), `${workflow.path} must publish artifacts through registry trusted publishing.`)
	assert(!text.includes('bun publish'), `${workflow.path} must not use bun publish for registry trusted publishing.`)
	assert(!text.includes('NPM_CONFIG_TOKEN') && !text.includes('NPM_TOKEN'), `${workflow.path} must not use long-lived registry publish tokens.`)
	const forbiddenWorkflowNpmCommands = text.split(/\r?\n/).filter(line => NPM_FAMILY_COMMAND_PATTERN.test(line) && !isAllowedNpmFamilyCommand(workflow.path, line))
	assert(forbiddenWorkflowNpmCommands.length === 0, `${workflow.path} must not run npm-family commands other than the trusted ${NPM_CLI_NAME} publish command.`)
}

const antiSlopDir = 'tools/oxlint/anti-slop'
const antiSlopVitePlusImports = existsSync(repoPath(antiSlopDir)) ? findFilesContaining(antiSlopDir, 'vite-plus/lint/') : []
assert(antiSlopVitePlusImports.length === 0, `Vendored anti-slop files must import @oxlint/plugins, not the older copy behind vite-plus/lint (revert vp migrate's rewrite): ${antiSlopVitePlusImports.join(', ')}`)

const npmFamilyCommands = findNpmFamilyCommands()
assert(npmFamilyCommands.length === 0, `Arroxy-owned tooling must not use npm-family commands:\n${npmFamilyCommands.join('\n')}`)

for (const {dir, packageJson} of packageRecords) {
	assert(!fmtIgnorePatterns.some(pattern => ignoreCoversPackage(pattern, dir)), `${dir} must not be excluded by vite.config.ts fmt.ignorePatterns.`)
	assert(Object.hasOwn(knipWorkspaces, dir), `${dir} must be represented in knip.json workspaces.`)

	if (existsSync(repoPath(`${dir}/src`)) && hasSourceFiles(`${dir}/src`)) {
		const coveringPrefixes = [`${dir}/src/`, `${dir.split('/')[0]}/*/src/`]
		assert(
			noCycleFiles.some(pattern => coveringPrefixes.some(prefix => pattern.startsWith(prefix))),
			`${dir}/src must be covered by the import/no-cycle lint override.`
		)
	}

	const packageConfigFiles = findPackageConfigFiles(dir)
	assert(packageConfigFiles.length === 0, `${dir} must not define package-local formatter/linter configs: ${packageConfigFiles.join(', ')}`)
	if (existsSync(repoPath(`${dir}/vite.config.ts`))) {
		const packageViteConfig = await importConfig(`${dir}/vite.config.ts`)
		for (const block of ['fmt', 'lint', 'staged']) {
			assert(packageViteConfig[block] === undefined, `${dir}/vite.config.ts must not define a ${block} block; the root vite.config.ts owns it.`)
		}
	}

	const publishable = packageJson.private !== true && Boolean(packageJson.name) && Boolean(packageJson.version)
	if (!publishable) continue

	const packageScripts = stringMap(packageJson.scripts)
	for (const scriptName of REQUIRED_PACKAGE_SCRIPTS) {
		assert(typeof packageScripts[scriptName] === 'string' && packageScripts[scriptName].length > 0, `${dir} is publishable and must expose script "${scriptName}".`)
	}
	assert(packageScripts['pack:dry-run'] === 'bun pm pack --dry-run', `${dir} pack:dry-run must use bun pm pack --dry-run.`)

	for (const section of PUBLISH_DEPENDENCY_SECTIONS) {
		const deps = stringMap(packageJson[section])
		for (const [name, spec] of Object.entries(deps)) {
			if (!hasWorkspaceProtocol(spec)) continue
			assert(spec === 'workspace:*', `${dir} publishable ${section}.${name} must use workspace:* or plain semver; got ${spec}.`)
			assert(workspacePackageNames.has(name), `${dir} publishable ${section}.${name} uses ${spec}, but no workspace package named ${name} exists.`)
		}
	}
}

for (const section of ROOT_DEPENDENCY_SECTIONS) {
	const deps = stringMap(rootPackage[section])
	for (const [name, spec] of Object.entries(deps)) {
		if (!hasWorkspaceProtocol(spec)) continue
		assert(workspacePackageNames.has(name), `Root ${section}.${name} uses ${spec}, but no workspace package named ${name} exists.`)
	}
}

if (failures.length > 0) {
	console.error('[tooling-contract] failed:')
	for (const failure of failures) console.error(`- ${failure}`)
	process.exit(1)
}

console.log(`[tooling-contract] OK - ${packageRecords.length} workspace packages checked.`)
