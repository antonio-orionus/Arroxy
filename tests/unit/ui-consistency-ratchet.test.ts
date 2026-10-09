import {existsSync, readdirSync, readFileSync, writeFileSync} from 'node:fs'
import path from 'node:path'
import {describe, expect, it} from 'vitest'

// Ratchet on one-off styling outside the design-system primitives.
//
// Every screen used to pick its own font sizes, colours, radii, and shadows, so
// no two surfaces matched. The fix is a small set of primitives and composites
// that own the look; call sites compose them. This test records, per file, how
// many one-off values each file still carries. Counts may only go down: a new
// one-off fails the build, and removing one fails until the baseline is
// lowered, so the gain is locked in.
//
// Lower the baseline after a cleanup with:
//   UPDATE_UI_RATCHET=1 bunx vitest run --project node tests/unit/ui-consistency-ratchet.test.ts

const RENDERER_SRC = path.resolve('src/renderer/src')
const BASELINE_FILE = path.resolve('tests/unit/ui-consistency-baseline.json')

// The design system itself, and the dev-only scenario workbench, may hold raw values.
const EXEMPT_DIRS = [path.join(RENDERER_SRC, 'components/ui'), path.join(RENDERER_SRC, 'dev')]

const PALETTE = 'red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|white|black'

const RULES = {
	// Font sizes come from the type scale (text-label/caption/xs/sm/title/headline/display).
	'arbitrary-font-size': /\btext-\[(?:\d|\.\d|calc)/g,
	// Colours come from semantic tokens (text-muted-foreground, bg-primary/12, border-border-strong).
	'arbitrary-color': /\b(?:text|bg|border(?:-[trblxyse])?|ring|outline|fill|stroke|from|via|to|decoration)-\[(?:var\(|#|hsla?\(|rgba?\(|oklch\(|color-mix\()/g,
	// Raw Tailwind palette colours bypass the theme and break one of the two skies.
	'palette-color': new RegExp(`\\b(?:text|bg|border|ring|fill|stroke)-(?:${PALETTE})(?:-\\d{2,3})?(?:\\/\\d+)?\\b`, 'g'),
	// Elevation is shadow-glow, shadow-selected, or a surface utility.
	'arbitrary-shadow': /\bshadow-\[/g,
	// Corners come from the radius scale.
	'arbitrary-radius': /\brounded(?:-[a-z]{1,2})?-\[/g,
	// Letter-spacing and line-height come with the type scale tokens.
	'arbitrary-type-metrics': /\b(?:tracking|leading)-\[/g,
	// Interactive elements come from the primitives (Button, Input, Select, Textarea, Field).
	'raw-control': /<(?:button|input|select|textarea|label)\b/g
} as const satisfies Record<string, RegExp>

type Rule = keyof typeof RULES
type Counts = Partial<Record<Rule, number>>
type Baseline = Record<string, Counts>

function sourceFiles(): string[] {
	return readdirSync(RENDERER_SRC, {recursive: true, encoding: 'utf8'})
		.map(entry => path.join(RENDERER_SRC, entry))
		.filter(file => /\.tsx?$/.test(file) && !EXEMPT_DIRS.some(dir => file.startsWith(dir + path.sep)))
		.sort()
}

function countFile(contents: string): Counts {
	const counts: Counts = {}
	for (const rule of Object.keys(RULES).filter(isRule)) {
		const hits = contents.match(RULES[rule])?.length ?? 0
		if (hits > 0) counts[rule] = hits
	}
	return counts
}

function measure(): Baseline {
	const result: Baseline = {}
	for (const file of sourceFiles()) {
		const counts = countFile(readFileSync(file, 'utf8'))
		if (Object.keys(counts).length > 0) result[path.relative(RENDERER_SRC, file).split(path.sep).join('/')] = counts
	}
	return result
}

// One file per line, matching the repo formatter, so a baseline update leaves no format diff.
function serializeBaseline(baseline: Baseline): string {
	const lines = Object.entries(baseline).map(([file, counts]) => {
		const fields = Object.entries(counts).map(([rule, count]) => `${JSON.stringify(rule)}: ${count}`)
		return `\t${JSON.stringify(file)}: {${fields.join(', ')}}`
	})
	return `{\n${lines.join(',\n')}\n}\n`
}

function readBaseline(): Baseline {
	if (!existsSync(BASELINE_FILE)) return {}
	const parsed: unknown = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'))
	if (!isRecord(parsed)) throw new Error(`${BASELINE_FILE} must be a JSON object`)
	const baseline: Baseline = {}
	for (const [file, counts] of Object.entries(parsed)) {
		if (!isRecord(counts)) throw new Error(`${BASELINE_FILE}: ${file} must map rules to counts`)
		const fileCounts: Counts = {}
		for (const [rule, count] of Object.entries(counts)) {
			if (!isRule(rule) || typeof count !== 'number') throw new Error(`${BASELINE_FILE}: ${file} has invalid entry ${rule}`)
			fileCounts[rule] = count
		}
		baseline[file] = fileCounts
	}
	return baseline
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isRule(value: string): value is Rule {
	return Object.hasOwn(RULES, value)
}

describe('ui consistency ratchet', () => {
	const current = measure()

	if (process.env.UPDATE_UI_RATCHET === '1') {
		writeFileSync(BASELINE_FILE, serializeBaseline(current))
	}

	const baseline = readBaseline()

	it('adds no new one-off styling outside the design-system primitives', () => {
		const regressions: string[] = []
		for (const [file, counts] of Object.entries(current)) {
			for (const [rule, count] of Object.entries(counts)) {
				if (!isRule(rule)) continue
				const allowed = baseline[file]?.[rule] ?? 0
				if (count > allowed) regressions.push(`${file}: ${rule} ${allowed} → ${count}`)
			}
		}
		expect(regressions, 'Use a design-system primitive or token instead of a one-off value.').toEqual([])
	})

	it('keeps the baseline as low as the code (lock in every cleanup)', () => {
		const stale: string[] = []
		for (const [file, counts] of Object.entries(baseline)) {
			for (const [rule, allowed] of Object.entries(counts)) {
				if (!isRule(rule)) continue
				const count = current[file]?.[rule] ?? 0
				if (count < allowed) stale.push(`${file}: ${rule} ${allowed} → ${count}`)
			}
		}
		expect(stale, 'Cleanup landed; lower the baseline with UPDATE_UI_RATCHET=1.').toEqual([])
	})
})
