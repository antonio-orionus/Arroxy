import {pathToFileURL} from 'node:url'
import {denoTargetFor, denoTargets, formatDenoShellEnv, parseDenoLatestVersion} from '../../src/main/services/binary/DenoBinarySource.js'

const DENO_LATEST_URL = 'https://dl.deno.land/release-latest.txt'

function normalizeFileUrlForComparison(href: string): string {
	return href.replace(/^file:\/\/\/([a-zA-Z]):/, (_match, drive: string) => `file:///${drive.toUpperCase()}:`)
}

function pathLikeToFileUrl(value: string): string {
	return pathToFileURL(value).href
}

function isCliEntrypoint(meta: Pick<ImportMeta, 'url'> & {main?: boolean}, argvPath: string | undefined = process.argv[1]): boolean {
	if (meta.main === true) return true
	if (!argvPath) return false
	return normalizeFileUrlForComparison(meta.url) === normalizeFileUrlForComparison(pathLikeToFileUrl(argvPath))
}

async function fetchLatestVersion(): Promise<string> {
	const response = await fetch(DENO_LATEST_URL)
	if (!response.ok) {
		throw new Error(`Deno latest-version request failed (${response.status}): ${DENO_LATEST_URL}`)
	}
	const version = parseDenoLatestVersion(await response.text())
	if (!version) {
		throw new Error('Deno latest-version response was not a valid release tag')
	}
	return version
}

async function main(args: string[]): Promise<void> {
	if (args[0] === '--list-targets') {
		console.log(
			denoTargets()
				.map(target => target.combo)
				.join('\n')
		)
		return
	}
	if (args[0] === '--target') {
		const target = args.length === 2 ? denoTargets().find(candidate => candidate.combo === args[1]) : denoTargetFor(args[1], args[2])
		if (!target) {
			throw new Error('usage: bun scripts/build/denoResolver.ts --target <platform>-<arch> | --target <platform> <arch>')
		}
		const requestedVersion = process.env.DENO_RELEASE_VERSION?.trim()
		const version = requestedVersion && requestedVersion.length > 0 ? requestedVersion : await fetchLatestVersion()
		const parsed = parseDenoLatestVersion(version)
		if (!parsed) {
			throw new Error(`invalid DENO_RELEASE_VERSION: ${version}`)
		}
		console.log(formatDenoShellEnv(target, parsed))
		return
	}

	throw new Error('usage: bun scripts/build/denoResolver.ts --list-targets | --target <platform>-<arch> | --target <platform> <arch>')
}

if (isCliEntrypoint(import.meta)) {
	main(process.argv.slice(2)).catch(error => {
		console.error(error instanceof Error ? error.message : String(error))
		process.exit(1)
	})
}
