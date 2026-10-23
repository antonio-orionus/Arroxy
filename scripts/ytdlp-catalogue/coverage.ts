// The coverage report written beside each catalogue: how much is labelled, what
// changed since the previous pin, which error sites still need a label, and
// where the rules drift. Markdown, for the job summary and the data branch.

import type {Catalogue, CatalogueSite} from './catalogue.js'
import type {Disagreement} from './label.js'

export interface CoverageInput {
	catalogue: Catalogue
	previous: Catalogue | null
	overrideHits: ReadonlyMap<string, number>
	disagreements: readonly Disagreement[]
	// Files the extractor could not parse: their sites are missing.
	parseFailures: readonly {file: string; error: string}[]
}

// How many rows a list shows before it says how many more there are.
const LIST_LIMIT = 40

export function coverageReport({catalogue, previous, overrideHits, disagreements, parseFailures}: CoverageInput): string {
	const {ytDlp, sites} = catalogue
	return [
		`# yt-dlp message catalogue: ${ytDlp.version}`,
		'',
		`Commit \`${ytDlp.commit}\` (${ytDlp.channel})${ytDlp.manifestGeneratedAt ? `, pinned by the runtime manifest of ${ytDlp.manifestGeneratedAt}` : ''}. ${sites.length} message sites; rules \`${catalogue.generator.rulesHash}\`.`,
		'',
		...(parseFailures.length ? ['## Files that did not parse', '', 'Their sites are missing from this catalogue.', '', ...parseFailures.map(failure => `- \`${failure.file}\`: ${failure.error}`), ''] : []),
		...sitesSection(sites),
		...labelledSection(sites),
		...relaySection(sites),
		...changesSection(sites, previous, parseFailures),
		...unlabelledSection(sites),
		...driftSection(overrideHits, disagreements)
	].join('\n')
}

function isCore(site: CatalogueSite): boolean {
	const {file} = site.at
	return !file.startsWith('yt_dlp/extractor/') || file === 'yt_dlp/extractor/common.py' || file === 'yt_dlp/extractor/youtube.py' || file.startsWith('yt_dlp/extractor/youtube/')
}

function counts<T extends string>(values: readonly T[]): [T, number][] {
	const out = new Map<T, number>()
	for (const value of values) out.set(value, (out.get(value) ?? 0) + 1)
	return [...out].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

function table(header: readonly string[], rows: readonly (readonly (string | number)[])[]): string[] {
	return [`| ${header.join(' | ')} |`, `|${header.map(() => '---').join('|')}|`, ...rows.map(row => `| ${row.join(' | ')} |`)]
}

function share(part: number, whole: number): string {
	return whole === 0 ? '0 / 0' : `${part} / ${whole} (${Math.round((part / whole) * 100)}%)`
}

function code(text: string | null): string {
	return text === null ? '_(computed)_' : `\`${text.replaceAll('`', 'ʼ').replaceAll('|', '\\|')}\``
}

function more(total: number): string[] {
	return total > LIST_LIMIT ? [`_…and ${total - LIST_LIMIT} more._`, ''] : ['']
}

function sitesSection(sites: readonly CatalogueSite[]): string[] {
	return ['## Sites', '', ...table(['Kind', 'Sites'], counts(sites.map(site => site.call.kind))), '', ...table(['Category', 'Sites'], counts(sites.map(site => site.label.category))), '']
}

function labelledSection(sites: readonly CatalogueSite[]): string[] {
	const errors = sites.filter(site => site.label.category === 'error')
	const core = errors.filter(isCore)
	const row = (field: 'failureKind' | 'accountHelps' | 'action'): string[] => {
		const tally = (group: readonly CatalogueSite[]): string[] => {
			// Unlabelled: no rule answered. A kind an override cleared on purpose is decided.
			const unlabelled = group.filter(site => site.label.from[field] === null).length
			const atRunTime = group.filter(site => site.label.from[field] === 'cause:http').length
			return [share(group.length - unlabelled - atRunTime, group.length), `${atRunTime} / ${group.length}`, `${unlabelled} / ${group.length}`]
		}
		return [field, ...tally(errors), ...tally(core)]
	}
	return [
		'## Labelled error sites',
		'',
		'"At run time": a download failure or an HTTPError, labelled by its HTTP status when it happens.',
		'',
		...table(['Field', 'Labelled', 'At run time', 'Unlabelled', 'Core and YouTube: labelled', 'At run time', 'Unlabelled'], [row('failureKind'), row('accountHelps'), row('action')]),
		''
	]
}

function relaySection(sites: readonly CatalogueSite[]): string[] {
	const relays = sites.filter(site => site.message.relays !== null)
	const page = relays.filter(site => site.message.relays?.startsWith('page:')).length
	const errors = relays.filter(site => site.label.category === 'error').length
	const noun = relays.length === 1 ? 'site' : 'sites'
	return ['## Relayed site text', '', `${relays.length} ${noun} may show site text (${errors} errors, ${relays.length - errors} other), ${page} of them scraped off the page. Their text is the site's, so only a run-time classifier can label it.`, '']
}

function changesSection(sites: readonly CatalogueSite[], previous: Catalogue | null, parseFailures: CoverageInput['parseFailures']): string[] {
	if (previous === null) return ['## Changes', '', 'No previous catalogue to compare with.', '']
	const before = new Map(previous.sites.map(site => [site.id, site]))
	const now = new Map(sites.map(site => [site.id, site]))
	const added = sites.filter(site => !before.has(site.id))
	// A file that did not parse lost its sites to the parser, not to yt-dlp.
	const unparsed = new Set(parseFailures.map(failure => failure.file))
	const missing = previous.sites.filter(site => !now.has(site.id) && unparsed.has(site.at.file)).length
	const removed = previous.sites.filter(site => !now.has(site.id) && !unparsed.has(site.at.file))
	// A reworded site keeps its file, scope, call and kind: pair those as changed.
	const slot = (site: CatalogueSite): string => [site.at.file, site.at.scope, site.call.name, site.call.kind].join('\0')
	const removedBySlot = new Map<string, CatalogueSite[]>()
	for (const site of removed) removedBySlot.set(slot(site), [...(removedBySlot.get(slot(site)) ?? []), site])
	const changed: [CatalogueSite, CatalogueSite][] = []
	const fresh: CatalogueSite[] = []
	for (const site of added) {
		const old = removedBySlot.get(slot(site))?.shift()
		if (old) changed.push([old, site])
		else fresh.push(site)
	}
	// The same id with another message (a cause, a relay, a suffix) changed in place.
	for (const site of sites) {
		const old = before.get(site.id)
		if (old !== undefined && (JSON.stringify(old.message) !== JSON.stringify(site.message) || JSON.stringify(old.call) !== JSON.stringify(site.call))) changed.push([old, site])
	}
	const gone = [...removedBySlot.values()].flat()
	const relabelled = sites.filter(site => {
		const old = before.get(site.id)
		return old !== undefined && JSON.stringify(old.label) !== JSON.stringify(site.label)
	}).length
	const where = (site: CatalogueSite): string => `${site.at.file}:${site.at.line}`
	return [
		`## Changes since ${previous.ytDlp.version}`,
		'',
		`${fresh.length} new, ${changed.length} changed, ${gone.length} removed; ${relabelled} relabelled under the same id.${missing ? ` ${missing} ${missing === 1 ? 'site' : 'sites'} in files that did not parse ${missing === 1 ? 'is' : 'are'} left out.` : ''}`,
		'',
		...(fresh.length
			? [
					'### New',
					'',
					...table(
						['Site', 'Call', 'Template'],
						fresh.slice(0, LIST_LIMIT).map(site => [where(site), site.call.name, code(site.message.template)])
					),
					...more(fresh.length)
				]
			: []),
		...(changed.length
			? [
					'### Changed',
					'',
					...table(
						['Site', 'Call', 'Was', 'Now'],
						changed.slice(0, LIST_LIMIT).map(([old, site]) => [where(site), site.call.name, code(old.message.printed), code(site.message.printed)])
					),
					...more(changed.length)
				]
			: []),
		...(gone.length
			? [
					'### Removed',
					'',
					...table(
						['Site', 'Call', 'Template'],
						gone.slice(0, LIST_LIMIT).map(site => [where(site), site.call.name, code(site.message.template)])
					),
					...more(gone.length)
				]
			: [])
	]
}

function unlabelledSection(sites: readonly CatalogueSite[]): string[] {
	const unlabelled = sites.filter(site => site.label.category === 'error' && site.label.from.failureKind === null)
	const groups = new Map<string, CatalogueSite[]>()
	for (const site of unlabelled) {
		const key = site.message.template ?? `\0${site.id}`
		groups.set(key, [...(groups.get(key) ?? []), site])
	}
	const ranked = [...groups.values()].sort((a, b) => Number(b.some(isCore)) - Number(a.some(isCore)) || b.length - a.length || (a[0].message.template ?? '').localeCompare(b[0].message.template ?? ''))
	const rows = ranked.slice(0, LIST_LIMIT).map(group => {
		const places = group.slice(0, 3).map(site => `${site.at.file}:${site.at.line}`)
		return [code(group[0].message.template), group.length, group[0].call.name, places.join(', ') + (group.length > 3 ? ', …' : '')]
	})
	return ['## Unlabelled error sites', '', `${unlabelled.length} error sites have no kind. Core and YouTube first, then by how many sites share the text.`, '', ...table(['Template', 'Sites', 'Call', 'Where'], rows), ...more(ranked.length)]
}

function driftSection(overrideHits: ReadonlyMap<string, number>, disagreements: readonly Disagreement[]): string[] {
	const stale = [...overrideHits].filter(([, hits]) => hits === 0).map(([name]) => name)
	return [
		'## Drift',
		'',
		stale.length ? `Overrides that matched nothing: ${stale.map(name => `\`${name}\``).join(', ')}.` : 'Every override matched a site.',
		'',
		...(disagreements.length
			? [
					'Sites whose text says another kind than their call:',
					'',
					...table(
						['Site', 'Call says', 'Text says'],
						disagreements.slice(0, LIST_LIMIT).map(d => [`${d.file}:${d.line}`, d.call, d.text])
					),
					...more(disagreements.length)
				]
			: ['No site’s text disagrees with its call.', ''])
	]
}
