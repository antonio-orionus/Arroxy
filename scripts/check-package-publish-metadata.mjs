#!/usr/bin/env node
import {execFileSync} from 'node:child_process'
import {existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync} from 'node:fs'
import {dirname, join, relative, resolve} from 'node:path'
import {tmpdir} from 'node:os'
import {fileURLToPath} from 'node:url'
import {gunzipSync} from 'node:zlib'

const DEFAULT_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const RUNTIME_DEPENDENCY_SECTIONS = ['dependencies', 'peerDependencies', 'optionalDependencies']

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

function isObject(value) {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringMap(value) {
	return isObject(value) ? value : {}
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

function packPackage(dir, tempRoot) {
	const destination = join(tempRoot, dir.replaceAll('/', '__'))
	mkdirSync(destination, {recursive: true})
	execFileSync('bun', ['pm', 'pack', '--destination', destination], {cwd: repoPath(dir), encoding: 'utf8', stdio: 'pipe'})
	const tarballs = readdirSync(destination).filter(file => file.endsWith('.tgz'))
	if (tarballs.length !== 1) throw new Error(`${dir} produced ${tarballs.length} tarballs in ${display(destination)}.`)
	return join(destination, tarballs[0])
}

function tarString(buffer, offset, length) {
	const slice = buffer.subarray(offset, offset + length)
	const end = slice.indexOf(0)
	return slice
		.subarray(0, end === -1 ? slice.length : end)
		.toString('utf8')
		.trim()
}

function readPackedPackageJson(tarball) {
	const archive = gunzipSync(readFileSync(tarball))
	let offset = 0

	while (offset + 512 <= archive.length) {
		const name = tarString(archive, offset, 100)
		if (!name) break
		const prefix = tarString(archive, offset + 345, 155)
		const path = prefix ? `${prefix}/${name}` : name
		const sizeText = tarString(archive, offset + 124, 12)
		const size = sizeText ? Number.parseInt(sizeText, 8) : 0
		const contentOffset = offset + 512

		if (path === 'package/package.json') {
			return JSON.parse(archive.subarray(contentOffset, contentOffset + size).toString('utf8'))
		}

		offset = contentOffset + Math.ceil(size / 512) * 512
	}

	throw new Error(`Could not find package/package.json in ${display(tarball)}.`)
}

function fail(message) {
	failures.push(message)
}

function assert(condition, message) {
	if (!condition) fail(message)
}

function localRuntimeDependencyNames(packageJson, workspaceNames) {
	const names = []
	for (const section of RUNTIME_DEPENDENCY_SECTIONS) {
		for (const name of Object.keys(stringMap(packageJson[section]))) {
			if (workspaceNames.has(name)) names.push(name)
		}
	}
	return names
}

function sortPublishablePackages(records) {
	const byName = new Map(records.map(record => [record.packageJson.name, record]).filter(([name]) => Boolean(name)))
	const visiting = new Set()
	const visited = new Set()
	const sorted = []

	const visit = record => {
		const name = record.packageJson.name
		if (visited.has(name)) return
		if (visiting.has(name)) throw new Error(`Cycle in publishable package dependencies at ${name}.`)
		visiting.add(name)
		for (const dependencyName of localRuntimeDependencyNames(record.packageJson, byName)) {
			const dependency = byName.get(dependencyName)
			if (dependency) visit(dependency)
		}
		visiting.delete(name)
		visited.add(name)
		sorted.push(record)
	}

	for (const record of records) visit(record)
	return sorted
}

// A top-level `types` beside `import` and `require` serves the ESM declarations to CommonJS consumers too
// ("masquerading as ESM"); each condition needs its own `types` (`.d.ts` for import, `.d.cts` for require).
function checkExportTypes(dir, packageJson) {
	for (const [subpath, target] of Object.entries(stringMap(packageJson.exports))) {
		if (!isObject(target) || !('require' in target)) continue
		assert(!('types' in target), `${dir} exports["${subpath}"] has a top-level types beside require; give import and require their own types.`)
		for (const condition of ['import', 'require']) {
			if (!(condition in target)) continue
			const entry = target[condition]
			const types = isObject(entry) ? entry.types : undefined
			const expected = condition === 'require' ? '.d.cts' : '.d.ts'
			assert(typeof types === 'string' && types.endsWith(expected), `${dir} exports["${subpath}"].${condition} needs its own types ending in ${expected}; got ${types ?? '<missing>'}.`)
		}
	}
}

const failures = []
const rootPackage = readJson('package.json')
const packageDirs = packageDirsFromWorkspaces(Array.isArray(rootPackage.workspaces) ? rootPackage.workspaces : [])
const packageRecords = packageDirs.map(dir => ({dir, packageJson: readJson(`${dir}/package.json`)}))
const workspaceVersions = new Map(packageRecords.map(({packageJson}) => [packageJson.name, packageJson.version]).filter(([name, version]) => Boolean(name) && Boolean(version)))
const publishablePackages = sortPublishablePackages(packageRecords.filter(({packageJson}) => packageJson.private !== true && Boolean(packageJson.name) && Boolean(packageJson.version)))
const tempRoot = mkdtempSync(join(tmpdir(), 'arroxy-package-metadata-'))

try {
	for (const {dir, packageJson} of publishablePackages) {
		checkExportTypes(dir, packageJson)
		const packedPackage = readPackedPackageJson(packPackage(dir, tempRoot))

		for (const section of RUNTIME_DEPENDENCY_SECTIONS) {
			const sourceDeps = stringMap(packageJson[section])
			const packedDeps = stringMap(packedPackage[section])
			for (const [name, packedSpec] of Object.entries(packedDeps)) {
				assert(typeof packedSpec !== 'string' || !packedSpec.startsWith('workspace:'), `${dir} packed ${section}.${name} still contains ${packedSpec}.`)
			}

			for (const [name, sourceSpec] of Object.entries(sourceDeps)) {
				if (sourceSpec !== 'workspace:*') continue
				const localVersion = workspaceVersions.get(name)
				assert(Boolean(localVersion), `${dir} source ${section}.${name} uses workspace:* but no local workspace package named ${name} exists.`)
				assert(packedDeps[name] === localVersion, `${dir} packed ${section}.${name} must resolve workspace:* to exact version ${localVersion}; got ${packedDeps[name] ?? '<missing>'}.`)
			}
		}
	}
} finally {
	rmSync(tempRoot, {recursive: true, force: true})
}

if (failures.length > 0) {
	console.error('[package-metadata] failed:')
	for (const failure of failures) console.error(`- ${failure}`)
	process.exit(1)
}

console.log(`[package-metadata] OK - ${publishablePackages.length} publishable packages packed with Bun metadata rewrite.`)
