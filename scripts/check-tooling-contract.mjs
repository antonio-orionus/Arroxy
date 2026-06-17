#!/usr/bin/env node
import {existsSync, readFileSync, readdirSync} from 'node:fs'
import {basename, dirname, join, relative, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const DEFAULT_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const REQUIRED_PACKAGE_SCRIPTS = ['typecheck', 'test', 'build', 'prepack', 'pack:dry-run']
const PUBLISH_DEPENDENCY_SECTIONS = ['dependencies', 'peerDependencies', 'optionalDependencies']
const ROOT_DEPENDENCY_SECTIONS = ['dependencies', 'devDependencies', 'optionalDependencies']
const PACKAGE_TOOLING_CONFIG_PATTERNS = [/^\.oxlintrc(?:\..*)?$/, /^oxlint\.config\./, /^eslint\.config\./, /^\.eslintrc(?:\..*)?$/, /^biome\.jsonc?$/, /^\.prettierrc(?:\..*)?$/, /^prettier\.config\./]
const COMMAND_SCAN_ROOTS = ['package.json', 'AGENTS.md', 'CONTRIBUTING.md', 'dev-docs', 'scripts', '.github', 'packages']
const COMMAND_SCAN_FILE_EXTENSIONS = new Set(['.json', '.jsonc', '.md', '.mjs', '.js', '.ts', '.tsx', '.mts', '.cts', '.yml', '.yaml', '.sh', '.ps1'])
const REQUIRED_GITIGNORE_ENTRIES = ['mise.local.toml', '.mise.local.toml', '.playwright-browsers/']
const NPM_CLI_NAME = 'np' + 'm'
const NPX_CLI_NAME = 'np' + 'x'
const NPM_FAMILY_COMMAND_PATTERN = new RegExp(String.raw`\b(?:${NPM_CLI_NAME}|${NPX_CLI_NAME})[ \t]+`)
const TRUSTED_NPM_PUBLISH_COMMAND = `${NPM_CLI_NAME} publish ./npm-artifacts/*.tgz --access public`
const TRUSTED_NPM_PUBLISH_WORKFLOWS = new Set(['.github/workflows/publish-ytdlp-errors.yml', '.github/workflows/publish-yt-dlp-bridge.yml'])

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

function includeCoversPackage(include, dir) {
	const normalized = posix(include)
	if (normalized.startsWith('!')) return false
	return [normalized === dir, normalized.startsWith(`${dir}/`), normalized.startsWith(`${dir}**`), normalized.includes(`${dir}/**`)].some(Boolean)
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
const workspaces = Array.isArray(rootPackage.workspaces) ? rootPackage.workspaces : []
const packageDirs = packageDirsFromWorkspaces(workspaces)
const packageRecords = packageDirs.map(dir => ({dir, packageJson: readJson(`${dir}/package.json`)}))
const workspacePackageNames = new Set(packageRecords.map(({packageJson}) => packageJson.name).filter(Boolean))
const biome = readJson('biome.jsonc')
const knip = readJson('knip.json')
const nodeVersion = readText('.node-version').trim()
const bunVersion = parseBunPackageManagerVersion(rootPackage.packageManager)
const miseConfigExists = existsSync(repoPath('mise.toml'))
const miseTools = miseConfigExists ? parseMiseTools(readText('mise.toml')) : {}
const ignoredEntries = gitignoreEntries(readText('.gitignore'))
const ciWorkflow = readText('.github/workflows/ci.yml')
const publishWorkflows = [
	{path: '.github/workflows/publish-ytdlp-errors.yml', command: 'bun run errors:check'},
	{path: '.github/workflows/publish-yt-dlp-bridge.yml', command: 'bun run bridge:check'}
]
const biomeIncludes = biome.files?.includes ?? []
const knipWorkspaces = knip.workspaces ?? {}
const madgeScript = posix(rootScripts.madge ?? '')

assert(rootPackage.private === true, 'Root package must stay private so workspace-only dependencies are never published from the app package.')
assert(miseConfigExists, 'mise.toml must define shared Node and Bun tool versions.')
assert(miseTools.node === nodeVersion, `mise.toml node must match .node-version (${nodeVersion}).`)
assert(bunVersion !== null, 'Root packageManager must pin Bun as bun@<version>.')
assert(miseTools.bun === bunVersion, `mise.toml bun must match packageManager (${bunVersion}).`)
for (const entry of REQUIRED_GITIGNORE_ENTRIES) {
	assert(ignoredEntries.has(entry), `.gitignore must ignore ${entry}.`)
}
assert(biome.formatter?.enabled !== false, 'Biome formatter must stay enabled.')
assert(biome.linter?.enabled === false, 'Biome linter must stay disabled; Oxlint is the lint authority.')
assert(biome.assist?.enabled === false, 'Biome assist must stay disabled unless the tooling contract is updated.')
assert(rootScripts['lint:prepare'] === 'bun run errors:build', 'Root scripts must expose lint:prepare as the type-aware lint dependency prebuild.')
assert((rootScripts.lint ?? '').startsWith('bun run lint:prepare && oxlint --type-aware .'), 'Root lint script must run lint:prepare before oxlint --type-aware.')
assert(rootScripts['lint:parity'] === undefined, 'lint:parity has been renamed; use check:tooling-parity.')
assert(rootScripts['check:tooling-parity'] === 'node scripts/check-tooling-parity.mjs', 'Root scripts must expose check:tooling-parity.')
assert(rootScripts['check:tooling-contract'] === 'node scripts/check-tooling-contract.mjs', 'Root scripts must expose check:tooling-contract.')
assert(rootScripts['packages:verify-metadata'] === 'node scripts/check-package-publish-metadata.mjs', 'Root scripts must expose packages:verify-metadata.')
assert((rootScripts.check ?? '').includes('bun run check:tooling-parity'), 'Root check must run check:tooling-parity.')
assert((rootScripts.check ?? '').includes('bun run check:tooling-contract'), 'Root check must run check:tooling-contract.')
assert(/&&\s*bun run packages:check\s*$/.test(rootScripts.check ?? ''), 'Root check must finish with packages:check.')
assert(ciWorkflow.includes('run: bun run check'), 'CI workflow must call the canonical root check.')

const lintStaged = stringMap(rootPackage['lint-staged'])
const formatLintStagedCommand = lintStaged['*.{ts,tsx,cts,mts,js,mjs,cjs,json,jsonc,css}'] ?? ''
assert(formatLintStagedCommand.includes('biome format --write'), 'lint-staged format command must run Biome fixes.')
assert(formatLintStagedCommand.includes('--no-errors-on-unmatched'), 'lint-staged Biome command must tolerate staged files ignored by Biome config.')
const jsLintStagedCommand = lintStaged['*.{ts,tsx,cts,mts,js,mjs,cjs}'] ?? ''
assert(jsLintStagedCommand.includes('bun run lint:prepare'), 'lint-staged JS/TS command must run lint:prepare before Oxlint.')
assert(jsLintStagedCommand.includes('oxlint --fix --deny-warnings'), 'lint-staged JS/TS command must run Oxlint fixes with denied warnings.')

const packagesCheck = rootScripts['packages:check'] ?? ''
const errorsCheckIndex = packagesCheck.indexOf('errors:check')
const bridgeCheckIndex = packagesCheck.indexOf('bridge:check')
const metadataCheckIndex = packagesCheck.indexOf('packages:verify-metadata')
assert(errorsCheckIndex !== -1 && bridgeCheckIndex !== -1 && metadataCheckIndex !== -1 && errorsCheckIndex < bridgeCheckIndex && bridgeCheckIndex < metadataCheckIndex, 'packages:check must run errors:check, bridge:check, then packages:verify-metadata.')

for (const workflow of publishWorkflows) {
	const text = readText(workflow.path)
	assert(text.includes(`run: ${workflow.command}`), `${workflow.path} must call "${workflow.command}".`)
	assert(text.includes('bun pm view'), `${workflow.path} must use bun pm view for registry version checks.`)
	assert(text.includes('bun pm pack --destination'), `${workflow.path} must pack artifacts with bun pm pack.`)
	assert(text.includes('uses: actions/setup-node@v6'), `${workflow.path} must set up Node for registry trusted publishing.`)
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

const npmFamilyCommands = findNpmFamilyCommands()
assert(npmFamilyCommands.length === 0, `Arroxy-owned tooling must not use npm-family commands:\n${npmFamilyCommands.join('\n')}`)

for (const {dir, packageJson} of packageRecords) {
	assert(
		biomeIncludes.some(include => includeCoversPackage(include, dir)),
		`${dir} must be represented in biome.jsonc files.includes.`
	)
	assert(Object.hasOwn(knipWorkspaces, dir), `${dir} must be represented in knip.json workspaces.`)

	if (existsSync(repoPath(`${dir}/src`)) && hasSourceFiles(`${dir}/src`)) {
		assert(madgeScript.includes(`${dir}/src`), `${dir}/src must be included in the root madge script.`)
	}

	const packageConfigFiles = findPackageConfigFiles(dir)
	assert(packageConfigFiles.length === 0, `${dir} must not define package-local formatter/linter configs: ${packageConfigFiles.join(', ')}`)

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
