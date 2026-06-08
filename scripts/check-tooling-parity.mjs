import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createRequire} from 'node:module'
import {spawnSync} from 'node:child_process'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const requireFromRepo = createRequire(join(repoRoot, 'package.json'))
const bin = name => join(repoRoot, 'node_modules', '.bin', process.platform === 'win32' ? `${name}.cmd` : name)

const tempDir = mkdtempSync(join(tmpdir(), 'arroxy-tooling-parity-'))
const oxlintConfigPath = join(repoRoot, '.oxlintrc.json')

const requiredRules = [
	'typescript/no-unsafe-assignment',
	'typescript/no-unsafe-call',
	'typescript/no-unsafe-member-access',
	'typescript/no-unsafe-return',
	'typescript/restrict-template-expressions',
	'typescript/unbound-method',
	'react-hooks-js/rules-of-hooks',
	'react-hooks-js/set-state-in-render',
	'react-hooks-js/static-components',
	'security/detect-non-literal-regexp',
	'security/detect-child-process',
	'react-js/no-deprecated'
]

function fail(message, detail) {
	if (detail) {
		console.error(detail)
	}
	throw new Error(message)
}

function run(label, command, args) {
	const result = spawnSync(command, args, {cwd: repoRoot, encoding: 'utf8', env: {...process.env, FORCE_COLOR: '0', NO_COLOR: '1'}})
	const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
	return {label, status: result.status, output}
}

function assertFailsWith(result, needles) {
	if (result.status === 0) {
		fail(`${result.label} unexpectedly passed`, result.output)
	}
	const missing = needles.filter(needle => !result.output.includes(needle))
	if (missing.length > 0) {
		fail(`${result.label} did not report expected diagnostics: ${missing.join(', ')}`, result.output)
	}
}

function flattenRules(config) {
	const rules = new Set(Object.keys(config.rules ?? {}))
	for (const override of config.overrides ?? []) {
		for (const rule of Object.keys(override.rules ?? {})) {
			rules.add(rule)
		}
	}
	return rules
}

try {
	const oxlintConfig = JSON.parse(readFileSync(oxlintConfigPath, 'utf8'))
	const configuredRules = flattenRules(oxlintConfig)
	const missingRules = requiredRules.filter(rule => !configuredRules.has(rule))
	if (missingRules.length > 0) {
		fail(`Oxlint config is missing parity-critical rules: ${missingRules.join(', ')}`)
	}

	const tsconfigPath = join(tempDir, 'tsconfig.json')
	writeFileSync(tsconfigPath, JSON.stringify({compilerOptions: {target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext', strict: true, jsx: 'react-jsx', noEmit: true}, include: ['*.ts', '*.tsx']}, null, 2))

	const biomeSyntaxPath = join(tempDir, 'biome-syntax.js')
	const biomeConfigPath = join(tempDir, 'biome.jsonc')
	writeFileSync(biomeConfigPath, JSON.stringify({$schema: join(repoRoot, 'node_modules/@biomejs/biome/configuration_schema.json'), files: {ignoreUnknown: false, includes: ['**/*.js']}, formatter: {enabled: true}, linter: {enabled: false}, assist: {enabled: false}}, null, 2))
	writeFileSync(biomeSyntaxPath, 'export const octal = 010;\n')
	assertFailsWith(run('Biome parser parity', bin('biome'), ['check', '--config-path', biomeConfigPath, biomeSyntaxPath]), ['octal'])

	const unsafePath = join(tempDir, 'unsafe.ts')
	writeFileSync(
		unsafePath,
		[
			'declare const value: any;',
			'export const assigned: string = value;',
			'export const member = value.deep.field;',
			'export const called = value();',
			'export function leak() {',
			'  return value;',
			'}',
			"const objectValue = { label: 'value' };",
			'export const message = `value: ${objectValue}`;',
			'class Counter {',
			'  method() {',
			'    return 1;',
			'  }',
			'}',
			'const counter = new Counter();',
			'export const unbound = counter.method;'
		].join('\n')
	)
	assertFailsWith(run('Oxlint type-aware parity', bin('oxlint'), ['--config', oxlintConfigPath, '--tsconfig', tsconfigPath, unsafePath]), ['no-unsafe-assignment', 'no-unsafe-call', 'no-unsafe-member-access', 'no-unsafe-return', 'restrict-template-expressions', 'unbound-method'])

	const bridgeConfigPath = join(tempDir, '.oxlintrc.parity.json')
	writeFileSync(
		bridgeConfigPath,
		JSON.stringify(
			{
				$schema: join(repoRoot, 'node_modules/oxlint/configuration_schema.json'),
				env: {browser: true, builtin: true, node: true},
				plugins: ['eslint', 'typescript', 'react', 'jsx-a11y'],
				options: {typeAware: true},
				jsPlugins: [
					{name: 'react-hooks-js', specifier: requireFromRepo.resolve('eslint-plugin-react-hooks')},
					{name: 'security', specifier: requireFromRepo.resolve('eslint-plugin-security')},
					{name: 'react-js', specifier: requireFromRepo.resolve('eslint-plugin-react')}
				],
				rules: {'react-hooks-js/rules-of-hooks': 'error', 'react-hooks-js/set-state-in-render': 'error', 'react-hooks-js/static-components': 'error', 'security/detect-child-process': 'error', 'security/detect-non-literal-regexp': 'error', 'react-js/no-deprecated': 'error'}
			},
			null,
			2
		)
	)

	const hooksPath = join(tempDir, 'hooks.tsx')
	writeFileSync(hooksPath, ["import { useState } from 'react';", 'export function BrokenHook({ value }: { value: number }) {', '  if (value > 0) {', '    useState(0);', '  }', '  return <button>{value}</button>;', '}'].join('\n'))
	assertFailsWith(run('Oxlint React hooks bridge parity', bin('oxlint'), ['--config', bridgeConfigPath, '--tsconfig', tsconfigPath, hooksPath]), ['rules-of-hooks'])

	const setStatePath = join(tempDir, 'set-state.tsx')
	writeFileSync(setStatePath, ["import { useState } from 'react';", 'export function BrokenSetState({ value }: { value: number }) {', '  const [count, setCount] = useState(0);', '  setCount(value);', '  return <button>{count}</button>;', '}'].join('\n'))
	assertFailsWith(run('Oxlint React compiler bridge parity', bin('oxlint'), ['--config', bridgeConfigPath, '--tsconfig', tsconfigPath, setStatePath]), ['set-state-in-render'])

	const staticPath = join(tempDir, 'static.tsx')
	writeFileSync(staticPath, ['export function Parent({ value }: { value: number }) {', '  function Child() {', '    return <span>{value}</span>;', '  }', '  return <Child />;', '}'].join('\n'))
	assertFailsWith(run('Oxlint React static-components bridge parity', bin('oxlint'), ['--config', bridgeConfigPath, '--tsconfig', tsconfigPath, staticPath]), ['static-components'])

	const deprecatedReactPath = join(tempDir, 'deprecated-react.tsx')
	writeFileSync(deprecatedReactPath, ["import ReactDOM from 'react-dom';", "const root = document.createElement('div');", 'ReactDOM.render(<span />, root);'].join('\n'))
	assertFailsWith(run('Oxlint React deprecated bridge parity', bin('oxlint'), ['--config', bridgeConfigPath, '--tsconfig', tsconfigPath, deprecatedReactPath]), ['no-deprecated'])

	const securityPath = join(tempDir, 'security.js')
	writeFileSync(securityPath, ["const childProcess = require('node:child_process');", 'const command = process.argv[2];', 'const pattern = process.argv[3];', 'childProcess.exec(command);', 'new RegExp(pattern);'].join('\n'))
	assertFailsWith(run('Oxlint security bridge parity', bin('oxlint'), ['--config', bridgeConfigPath, securityPath]), ['detect-child-process', 'detect-non-literal-regexp'])

	console.log('Tooling parity checks passed.')
} finally {
	rmSync(tempDir, {recursive: true, force: true})
}
