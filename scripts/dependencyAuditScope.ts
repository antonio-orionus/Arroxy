#!/usr/bin/env bun
import {spawnSync} from 'node:child_process'
import {appendFileSync, readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const DEPENDENCY_GRAPH_FIELDS = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies', 'bundleDependencies', 'bundledDependencies', 'overrides', 'resolutions', 'workspaces', 'trustedDependencies', 'patchedDependencies', 'catalog', 'catalogs'] as const

type JsonValue = null | boolean | number | string | JsonValue[] | {[key: string]: JsonValue}

interface DependencyAuditInput {
	basePackageJson: unknown
	headPackageJson: unknown
	lockfileChanged: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sortJson(value: unknown): JsonValue {
	if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
	if (Array.isArray(value)) return value.map(sortJson)
	if (!isRecord(value)) return null

	return Object.fromEntries(
		Object.entries(value)
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([key, child]) => [key, sortJson(child)])
	)
}

function dependencyGraphSnapshot(packageJson: unknown): JsonValue {
	if (!isRecord(packageJson)) return {}

	const snapshot: Record<string, JsonValue> = {}
	for (const field of DEPENDENCY_GRAPH_FIELDS) {
		if (Object.hasOwn(packageJson, field)) snapshot[field] = sortJson(packageJson[field])
	}
	return snapshot
}

export function dependencyAuditRequired(input: DependencyAuditInput): boolean {
	if (input.lockfileChanged) return true

	return JSON.stringify(dependencyGraphSnapshot(input.basePackageJson)) !== JSON.stringify(dependencyGraphSnapshot(input.headPackageJson))
}

function gitOutput(args: string[]): string {
	const result = spawnSync('git', args, {encoding: 'utf8'})
	if (result.status === 0) return result.stdout

	const detail = result.stderr.trim() || result.stdout.trim() || `exit code ${result.status ?? 'unknown'}`
	throw new Error(`git ${args.join(' ')} failed: ${detail}`)
}

function gitLockfileChanged(baseRef: string): boolean {
	const result = spawnSync('git', ['diff', '--quiet', baseRef, '--', 'bun.lock'], {encoding: 'utf8'})
	if (result.status === 0) return false
	if (result.status === 1) return true

	const detail = result.stderr.trim() || result.stdout.trim() || `exit code ${result.status ?? 'unknown'}`
	throw new Error(`git diff --quiet ${baseRef} -- bun.lock failed: ${detail}`)
}

function setGitHubOutput(name: string, value: string): void {
	const outputPath = process.env.GITHUB_OUTPUT
	if (!outputPath) return
	appendFileSync(outputPath, `${name}=${value}\n`)
}

function readJson(text: string): unknown {
	return JSON.parse(text) as unknown
}

function main(argv: string[]): void {
	const baseRef = argv[0]
	if (!baseRef) throw new Error('usage: bun scripts/dependencyAuditScope.ts <base-ref>')

	const required = dependencyAuditRequired({basePackageJson: readJson(gitOutput(['show', `${baseRef}:package.json`])), headPackageJson: readJson(readFileSync('package.json', 'utf8')), lockfileChanged: gitLockfileChanged(baseRef)})

	setGitHubOutput('audit_required', String(required))
	console.log(required ? '[deps:vuln] dependency graph changed; audit required.' : '[deps:vuln] dependency graph unchanged; skipping audit.')
}

const isCli = process.argv[1] ? resolve(process.argv[1]) === fileURLToPath(import.meta.url) : false
if (isCli) {
	try {
		main(process.argv.slice(2))
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error))
		process.exitCode = 1
	}
}
