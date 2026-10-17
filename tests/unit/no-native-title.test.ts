import {readdirSync, readFileSync} from 'node:fs'
import path from 'node:path'
import * as ts from 'typescript'
import {describe, expect, it} from 'vite-plus/test'

// Hints come from the app tooltip (the shared Hint), never the native `title`
// attribute: `title` draws a second, unstyled bubble beside the app tooltip,
// or a lone one that looks like no other hint in the app.
//
// The components below take `title` as visible heading text, not a hint.
// Any other JSX element carrying `title` fails.
const TITLE_IS_VISIBLE_TEXT = new Set(['ActionRow', 'OptionCard', 'Panel', 'PanelSection', 'VideoSummaryCard'])

const RENDERER_SRC = path.resolve('src/renderer/src')
const EXEMPT_DIRS = [path.join(RENDERER_SRC, 'dev')]

function tsxFiles(): string[] {
	return readdirSync(RENDERER_SRC, {recursive: true, encoding: 'utf8'})
		.map(entry => path.join(RENDERER_SRC, entry))
		.filter(file => file.endsWith('.tsx') && !EXEMPT_DIRS.some(dir => file.startsWith(dir + path.sep)))
}

function nativeTitles(file: string): string[] {
	const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
	const hits: string[] = []
	const visit = (node: ts.Node): void => {
		if (ts.isJsxAttribute(node) && node.name.getText(source) === 'title') {
			const tag = node.parent.parent.tagName.getText(source)
			if (!TITLE_IS_VISIBLE_TEXT.has(tag)) {
				const {line} = source.getLineAndCharacterOfPosition(node.getStart(source))
				hits.push(`${path.relative(RENDERER_SRC, file)}:${line + 1} <${tag} title>`)
			}
		}
		ts.forEachChild(node, visit)
	}
	visit(source)
	return hits
}

describe('native title hints', () => {
	it('no renderer element uses the native title attribute as a hint', () => {
		expect(tsxFiles().flatMap(nativeTitles)).toEqual([])
	})
})
