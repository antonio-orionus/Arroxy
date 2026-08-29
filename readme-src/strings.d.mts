// Types for the README locale registry so scripts/check-locale-parity.ts can
// read it from TypeScript. The registry itself stays plain ESM — readme-src is
// outside the app's tsconfig project.

export interface ReadmeLocale {
	code: string
	filename: string
	name: string
	strings: Record<string, string>
}

export declare const LOCALES: readonly ReadmeLocale[]
