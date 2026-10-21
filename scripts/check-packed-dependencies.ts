#!/usr/bin/env bun
// Publish precheck for workspace packages; the publish-*.yml workflows call it
// on the tarball they are about to publish.
//
//   bun scripts/check-packed-dependencies.ts npm-artifacts/yt-dlp-bridge-0.6.2.tgz
//     Exits 1 when the packed package.json pins a local workspace package at a
//     version the registry does not have, naming the package to publish first.
//
// NPM_CONFIG_REGISTRY overrides the registry (default https://registry.npmjs.org).

import {spawnSync} from 'node:child_process'
import {existsSync, readFileSync, readdirSync} from 'node:fs'
import {join} from 'node:path'
import {z} from 'zod'
import {findUnpublishedPins, registryHasVersion, workspaceDependencyPins} from './packedDependencies.js'

const rootPackageSchema = z.object({workspaces: z.array(z.string())})
const packageNameSchema = z.object({name: z.string()})

// Root workspaces are `dir/*` globs; each child with a package.json is a package.
function workspaceNames(root: string): Set<string> {
	const {workspaces} = rootPackageSchema.parse(JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')))
	const names = new Set<string>()
	for (const pattern of workspaces) {
		if (!pattern.endsWith('/*')) throw new Error(`unsupported workspace pattern ${pattern}`)
		const parent = join(root, pattern.slice(0, -2))
		for (const entry of readdirSync(parent, {withFileTypes: true})) {
			const manifest = join(parent, entry.name, 'package.json')
			if (entry.isDirectory() && existsSync(manifest)) names.add(packageNameSchema.parse(JSON.parse(readFileSync(manifest, 'utf8'))).name)
		}
	}
	return names
}

function packedPackageJson(tarball: string): unknown {
	const result = spawnSync('tar', ['-xzOf', tarball, 'package/package.json'], {encoding: 'utf8'})
	if (result.error) throw new Error(`could not run tar: ${result.error.message}`)
	if (result.status !== 0) throw new Error(`could not read package/package.json from ${tarball}: ${result.stderr.trim()}`)
	return JSON.parse(result.stdout)
}

const tarballs = process.argv.slice(2)
if (tarballs.length === 0) {
	console.error('usage: bun scripts/check-packed-dependencies.ts <tarball>...')
	process.exit(2)
}

const names = workspaceNames(process.cwd())
const registry = process.env.NPM_CONFIG_REGISTRY ?? process.env.npm_config_registry ?? 'https://registry.npmjs.org'
const hasVersion = (name: string, version: string): Promise<boolean> => registryHasVersion(name, version, {registry, fetch: url => fetch(url)})

let failed = false
for (const tarball of tarballs) {
	const pins = workspaceDependencyPins(packedPackageJson(tarball), names)
	const problems = await findUnpublishedPins(pins, hasVersion)
	for (const problem of problems) console.error(`::error::${tarball}: ${problem}`)
	if (problems.length > 0) failed = true
	else console.log(`[packed-dependencies] ${tarball}: ${pins.length === 0 ? 'no workspace dependencies' : pins.map(pin => `${pin.name}@${pin.spec}`).join(', ') + ' on the registry'}`)
}
if (failed) process.exit(1)
