import {readdirSync, readFileSync} from 'node:fs'
import path from 'node:path'
import postcss, {type Root, type Rule} from 'postcss'
import {converter, parse, wcagContrast, type Color, type Rgb} from 'culori'
import {describe, expect, it} from 'vite-plus/test'
import {UI_STYLES, type UiStyle} from '@shared/schemas.js'
import {BASE_STYLE} from '../../src/renderer/src/styles/registry.js'

// Enforces DESIGN.md §8: one contract, defined by the base style's stylesheet;
// every other style sets exactly that contract in both schemes and nothing else;
// nothing outside the style stylesheets touches it; every pair keeps AA contrast.

const RENDERER = path.resolve(__dirname, '../../src/renderer/src')
const STYLES_DIR = path.join(RENDERER, 'styles')
const SCHEMES = ['light', 'dark'] as const
type Scheme = (typeof SCHEMES)[number]
type Tokens = Map<string, string>

function readCss(file: string): Root {
	return postcss.parse(readFileSync(file, 'utf8'), {from: file})
}

function selectorsFor(style: UiStyle): Record<Scheme, string> {
	if (style === BASE_STYLE) return {light: ':root', dark: '.dark'}
	return {light: `:root[data-style='${style}']`, dark: `:root[data-style='${style}'].dark`}
}

// Each style stylesheet: exactly one rule per scheme, holding only custom properties.
function readStyle(style: UiStyle): Record<Scheme, Tokens> {
	const root = readCss(path.join(STYLES_DIR, `${style}.css`))
	const selectors = selectorsFor(style)
	const tokens: Record<Scheme, Tokens> = {light: new Map(), dark: new Map()}
	const seen: string[] = []
	root.each(node => {
		if (node.type === 'comment') return
		if (node.type !== 'rule') throw new Error(`${style}.css: only rules are allowed, found ${node.type}`)
		const rule: Rule = node
		seen.push(rule.selector)
		const scheme = SCHEMES.find(candidate => selectors[candidate] === rule.selector)
		if (!scheme) throw new Error(`${style}.css: unexpected selector ${rule.selector}`)
		rule.each(child => {
			if (child.type === 'comment') return
			if (child.type !== 'decl' || !child.prop.startsWith('--')) throw new Error(`${style}.css: only custom properties are allowed, found ${child.toString()}`)
			tokens[scheme].set(child.prop, child.value)
		})
	})
	expect(seen.sort()).toEqual([selectors.light, selectors.dark].sort())
	return tokens
}

const STYLE_TOKENS = Object.fromEntries(UI_STYLES.map(style => [style, readStyle(style)])) as Record<UiStyle, Record<Scheme, Tokens>>
const CONTRACT = [...STYLE_TOKENS[BASE_STYLE].light.keys()].sort()

function walkFiles(dir: string, accept: (file: string) => boolean): string[] {
	return readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
		const full = path.join(dir, entry.name)
		if (entry.isDirectory()) return walkFiles(full, accept)
		return accept(full) ? [full] : []
	})
}

describe('style contract completeness', () => {
	it('has a non-empty contract that the base style defines for both schemes', () => {
		expect(CONTRACT.length).toBeGreaterThan(0)
		expect([...STYLE_TOKENS[BASE_STYLE].dark.keys()].sort()).toEqual(CONTRACT)
	})

	it.each(UI_STYLES)('%s sets exactly the contract in both schemes', style => {
		for (const scheme of SCHEMES) {
			expect([...STYLE_TOKENS[style][scheme].keys()].sort(), `${style} ${scheme}`).toEqual(CONTRACT)
		}
	})

	it('has one stylesheet per registered style and nothing else', () => {
		const sheets = readdirSync(STYLES_DIR)
			.filter(name => name.endsWith('.css'))
			.map(name => name.replace(/\.css$/, ''))
		expect(sheets.sort()).toEqual([...UI_STYLES].sort())
	})
})

describe('style isolation', () => {
	const otherCss = walkFiles(RENDERER, file => file.endsWith('.css') && path.dirname(file) !== STYLES_DIR)

	it('never declares a contract token outside the style stylesheets', () => {
		const contract = new Set(CONTRACT)
		const leaks = otherCss.flatMap(file => {
			const found: string[] = []
			readCss(file).walkDecls(decl => {
				if (contract.has(decl.prop)) found.push(`${path.relative(RENDERER, file)}: ${decl.prop}`)
			})
			return found
		})
		expect(leaks).toEqual([])
	})

	it('never selects on a style outside the style stylesheets', () => {
		const files = [...otherCss, ...walkFiles(RENDERER, file => /\.(ts|tsx)$/.test(file))]
		const offenders = files.filter(file => readFileSync(file, 'utf8').includes('[data-style'))
		expect(offenders.map(file => path.relative(RENDERER, file))).toEqual([])
	})

	it('never compares against a style id in renderer code outside the registry', () => {
		const idLiteral = new RegExp(`['"\`](${UI_STYLES.join('|')})['"\`]`)
		const offenders = walkFiles(RENDERER, file => /\.(ts|tsx)$/.test(file) && file !== path.join(STYLES_DIR, 'registry.ts')).filter(file => idLiteral.test(readFileSync(file, 'utf8')))
		expect(offenders.map(file => path.relative(RENDERER, file))).toEqual([])
	})
})

describe('style contrast (WCAG AA)', () => {
	const toRgb = converter('rgb')

	function resolveColor(tokens: Tokens, value: string, depth = 0): Rgb {
		const reference = /^var\((--[a-z0-9-]+)\)$/.exec(value.trim())
		if (reference) {
			const next = tokens.get(reference[1])
			if (next === undefined || depth > 8) throw new Error(`unresolved ${value}`)
			return resolveColor(tokens, next, depth + 1)
		}
		const color: Color | undefined = parse(value)
		if (!color) throw new Error(`not a colour: ${value}`)
		return toRgb(color)
	}

	// A translucent colour is judged where it sits: composited over what is below it.
	function over(top: Rgb, below: Rgb): Rgb {
		const alpha = top.alpha ?? 1
		const mix = (front: number, back: number): number => front * alpha + back * (1 - alpha)
		return {mode: 'rgb', r: mix(top.r, below.r), g: mix(top.g, below.g), b: mix(top.b, below.b)}
	}

	const PAIRS: readonly {text: string; surface: string}[] = [
		{text: '--foreground', surface: '--background'},
		{text: '--card-foreground', surface: '--card'},
		{text: '--popover-foreground', surface: '--popover'},
		{text: '--muted-foreground', surface: '--background'},
		{text: '--muted-foreground', surface: '--card'},
		{text: '--muted-foreground', surface: '--popover'},
		{text: '--text-subtle', surface: '--card'},
		{text: '--selected-foreground', surface: '--card'},
		{text: '--foreground', surface: '--surface-stage'},
		{text: '--muted-foreground', surface: '--surface-stage'}
	]

	const cases = UI_STYLES.flatMap(style => SCHEMES.flatMap(scheme => PAIRS.map(pair => ({style, scheme, ...pair}))))

	it.each(cases)('$style $scheme: $text on $surface is at least 4.5:1', ({style, scheme, text, surface}) => {
		const tokens = STYLE_TOKENS[style][scheme]
		const read = (token: string): Rgb => resolveColor(tokens, `var(${token})`)
		const canvas = read('--background')
		const surfaceColor = over(read(surface), canvas)
		const textColor = over(read(text), surfaceColor)
		expect(wcagContrast(textColor, surfaceColor)).toBeGreaterThanOrEqual(4.5)
	})
})
