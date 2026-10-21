// Changelog fragments (`changelog.d/`, see its README.md) and the release
// section they assemble into. Runs from the repo root:
//
//   bun scripts/changelog.ts check                 every fragment well formed, no unreleased CHANGELOG.md section
//   bun scripts/changelog.ts assemble [version]    write ## <package.json version> and delete the fragments
//   bun scripts/changelog.ts verify-release <ver>  CHANGELOG.md has ## <ver> and no fragment is left over

import {spawnSync} from 'node:child_process'
import {existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync} from 'node:fs'
import valid from 'semver/functions/valid.js'
import {assembleSection, changelogProblems, FRAGMENT_DIR, FRAGMENT_README, fragmentProblems, insertSection, orderFragmentFiles, parseFragment} from './changelogFragments.js'

const CHANGELOG = 'CHANGELOG.md'

function fail(message: string): never {
	console.error(message)
	process.exit(1)
}

function packageVersion(): string {
	const parsed: unknown = JSON.parse(readFileSync('package.json', 'utf8'))
	const version = typeof parsed === 'object' && parsed !== null && 'version' in parsed ? parsed.version : undefined
	if (typeof version !== 'string' || valid(version) === null) fail('package.json has no valid semver "version"')
	return version
}

const fragmentFiles = (): string[] => (existsSync(FRAGMENT_DIR) ? readdirSync(FRAGMENT_DIR).filter(name => name !== FRAGMENT_README && !name.startsWith('.')) : []).map(name => `${FRAGMENT_DIR}/${name}`)

const fileProblems = (file: string): string[] => (statSync(file).isFile() ? fragmentProblems(file, readFileSync(file, 'utf8')) : [`${file}: ${FRAGMENT_DIR}/ holds fragment files only`])

const problems = (): string[] => [...fragmentFiles().flatMap(fileProblems), ...changelogProblems(readFileSync(CHANGELOG, 'utf8'), packageVersion())]

function gitAddLog(): string {
	const result = spawnSync('git', ['log', '--diff-filter=A', '--no-renames', '--format=%x00%ct', '--name-only', '--', FRAGMENT_DIR], {encoding: 'utf8'})
	if (result.status === 0) return result.stdout
	const reason = result.error?.message ?? result.stderr.trim()
	console.error(`git log could not give the order fragments merged in (${reason}); listing them in file name order. Reorder the section by hand if it matters.`)
	return ''
}

function assemble(requested: string | undefined): void {
	const version = packageVersion()
	if (requested !== undefined && requested.replace(/^v/, '') !== version) fail(`package.json is ${version}, not ${requested}: bump package.json first`)
	const files = fragmentFiles()
	if (files.length === 0) fail(`No changelog fragments in ${FRAGMENT_DIR}/: nothing user-facing to release for ${version}. Write ## ${version} by hand only if there is.`)
	const broken = files.flatMap(fileProblems)
	if (broken.length > 0) fail(broken.join('\n'))
	const fragments = orderFragmentFiles(files, gitAddLog()).map(file => parseFragment(file, readFileSync(file, 'utf8')))
	let changelog: string
	try {
		changelog = insertSection(readFileSync(CHANGELOG, 'utf8'), version, assembleSection(version, fragments))
	} catch (error) {
		fail(error instanceof Error ? error.message : String(error))
	}
	writeFileSync(CHANGELOG, changelog)
	for (const file of files) rmSync(file)
	console.log(`Wrote ## ${version} to ${CHANGELOG} from ${files.length} fragment(s) and deleted them. Read it over before committing release: ${version}.`)
}

function verifyRelease(version: string | undefined): void {
	if (version === undefined) fail('usage: bun scripts/changelog.ts verify-release <version>')
	const left = fragmentFiles()
	if (left.length > 0) fail(`${left.length} changelog fragment(s) in ${FRAGMENT_DIR}/ are not in a release section; run bun run changelog:assemble before committing release: ${version}`)
	const headings = readFileSync(CHANGELOG, 'utf8')
		.split(/\r?\n/)
		.map(line => line.trim())
	if (!headings.includes(`## ${version}`)) fail(`${CHANGELOG} has no ## ${version} section; run bun run changelog:assemble before committing release: ${version}`)
}

const [command, argument] = process.argv.slice(2)
switch (command) {
	case 'check': {
		const found = problems()
		if (found.length > 0) fail(found.join('\n'))
		break
	}
	case 'assemble':
		assemble(argument)
		break
	case 'verify-release':
		verifyRelease(argument)
		break
	default:
		fail(`usage: bun scripts/changelog.ts check | assemble [version] | verify-release <version>\n(${FRAGMENT_DIR}/${FRAGMENT_README} explains fragments)`)
}
