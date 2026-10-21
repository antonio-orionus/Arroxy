// Decisions behind the publish precheck for workspace packages, kept free of
// tarball and process I/O so they can be tested. `bun pm pack` rewrites a
// `workspace:*` dependency to the local package's exact version, which may not
// be on the registry yet; scripts/check-packed-dependencies.ts does the I/O.

import {z} from 'zod'

const RUNTIME_DEPENDENCY_SECTIONS = ['dependencies', 'peerDependencies', 'optionalDependencies'] as const
const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/

const packedPackageJsonSchema = z.looseObject({dependencies: z.record(z.string(), z.string()).optional(), peerDependencies: z.record(z.string(), z.string()).optional(), optionalDependencies: z.record(z.string(), z.string()).optional()})

export interface DependencyPin {
	name: string
	spec: string
}

export function workspaceDependencyPins(packedPackageJson: unknown, workspaceNames: ReadonlySet<string>): DependencyPin[] {
	const parsed = packedPackageJsonSchema.safeParse(packedPackageJson)
	if (!parsed.success) throw new Error(`packed package.json has an unexpected shape: ${parsed.error.message}`)
	return RUNTIME_DEPENDENCY_SECTIONS.flatMap(section =>
		Object.entries(parsed.data[section] ?? {})
			.filter(([name]) => workspaceNames.has(name))
			.map(([name, spec]) => ({name, spec}))
	)
}

export interface RegistryLookup {
	registry: string
	fetch: (url: string) => Promise<Response>
}

// The registry answers GET /<name>/<version> with 200 when that version exists
// and 404 when it does not; anything else is an outage, not an answer.
export async function registryHasVersion(name: string, version: string, lookup: RegistryLookup): Promise<boolean> {
	const url = `${lookup.registry.replace(/\/+$/, '')}/${name.replace('/', '%2f')}/${version}`
	const response = await lookup.fetch(url)
	if (response.status === 404) return false
	if (response.ok) return true
	throw new Error(`registry lookup of ${name}@${version} failed: HTTP ${response.status} from ${url}`)
}

export async function findUnpublishedPins(pins: readonly DependencyPin[], hasVersion: (name: string, version: string) => Promise<boolean>): Promise<string[]> {
	const problems: string[] = []
	for (const {name, spec} of pins) {
		if (!EXACT_VERSION.test(spec)) {
			problems.push(`${name} is packed as "${spec}", not an exact version; depend on it with workspace:* so the pin can be checked.`)
		} else if (!(await hasVersion(name, spec))) {
			problems.push(`publish ${name} ${spec} first: the packed package.json pins it, and the registry has no such version.`)
		}
	}
	return problems
}
