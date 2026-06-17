import {describe, expect, it} from 'vitest'

import {dependencyAuditRequired} from '../../scripts/dependencyAuditScope.js'

const basePackage = {name: 'arroxy', version: '0.4.0', scripts: {dev: 'bun run dev'}, dependencies: {react: '19.2.7'}, devDependencies: {vitest: '4.0.15'}, overrides: {esbuild: '0.28.1'}}

describe('dependency audit scope', () => {
	it('skips audit when package.json changes do not affect the dependency graph', () => {
		const headPackage = {...basePackage, scripts: {...basePackage.scripts, doctor: 'bun scripts/dev-env.ts doctor'}, engines: {node: '24.16.0', bun: '1.2.23'}}

		expect(dependencyAuditRequired({basePackageJson: basePackage, headPackageJson: headPackage, lockfileChanged: false})).toBe(false)
	})

	it('requires audit when bun.lock changed', () => {
		expect(dependencyAuditRequired({basePackageJson: basePackage, headPackageJson: basePackage, lockfileChanged: true})).toBe(true)
	})

	it('requires audit when dependencies changed', () => {
		const headPackage = {...basePackage, dependencies: {...basePackage.dependencies, zod: '4.4.3'}}

		expect(dependencyAuditRequired({basePackageJson: basePackage, headPackageJson: headPackage, lockfileChanged: false})).toBe(true)
	})

	it('requires audit when dependency overrides changed', () => {
		const headPackage = {...basePackage, overrides: {...basePackage.overrides, hono: '4.12.25'}}

		expect(dependencyAuditRequired({basePackageJson: basePackage, headPackageJson: headPackage, lockfileChanged: false})).toBe(true)
	})
})
