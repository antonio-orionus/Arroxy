// The yt-dlp message catalogue: every message site in one yt-dlp commit, with
// engine-neutral labels and the rule that gave each one. scripts/ytdlp-catalogue/
// extract.ts lists the sites, label.ts labels them, build.ts writes the file and
// its coverage report.

import {z} from 'zod'
import {YT_DLP_ERROR_KINDS} from 'ytdlp-errors'

// Today's yt-dlp error kinds, which the engine seam renames FailureKind, plus
// `siteChanged`: the page was not what the extractor expected, often a site
// change, sometimes a wall it did not recognise. `unknown` is no label: an
// unlabelled field is null.
export const failureKindSchema = z.enum([...YT_DLP_ERROR_KINDS, 'siteChanged']).exclude(['unknown'])
export type FailureKind = z.infer<typeof failureKindSchema>

export const accountHelpsSchema = z.enum(['yes', 'no', 'maybe'])
export type AccountHelps = z.infer<typeof accountHelpsSchema>

export const userActionSchema = z.enum(['signIn', 'retryLater', 'retry', 'changeNetwork', 'updateEngine', 'installDependency', 'freeDiskSpace', 'chooseOutputFolder', 'chooseAnotherFormat', 'none'])
export type UserAction = z.infer<typeof userActionSchema>

// The message's role, not its meaning: FailureKind carries the meaning.
export const categorySchema = z.enum(['error', 'warning', 'status', 'debug', 'deprecation'])
export type Category = z.infer<typeof categorySchema>

// Which rule gave a field. `model:<name>` is reserved for the labelling
// routine, which fills only fields every other rule left null.
export const provenanceSchema = z
	.string()
	.regex(/^(?:override:.+|call:.+|suffix:bugReport|pattern:.+|cause:http|model:.+)$/)
	.nullable()
export type Provenance = z.infer<typeof provenanceSchema>

const suffixSchema = z.enum(['loginHint', 'bugReport', 'causedBy'])
export type Suffix = z.infer<typeof suffixSchema>

export const catalogueSiteSchema = z.strictObject({
	// 12 hex: from the file, scope, call, kind and template, and which of the
	// same in that scope it is. Free of line numbers, so a site keeps its id
	// when code above it moves.
	id: z.string().regex(/^[0-9a-f]{12}$/),
	at: z.strictObject({file: z.string(), line: z.number().int().positive(), scope: z.string(), extractor: z.string().nullable()}),
	call: z.strictObject({name: z.string(), kind: z.enum(['raise', 'helper', 'report', 'status', 'regex', 'download']), loginMethod: z.enum(['password', 'cookies', 'session_cookies', 'any', 'default', 'dynamic']).optional()}),
	message: z.strictObject({
		template: z.string().nullable(),
		shape: z.enum(['literal', 'template', 'default', 'relay', 'dynamic']),
		relays: z.string().nullable(),
		// How it reaches the output: `ERROR: [youtube] {template}{bugReport}`.
		printed: z.string(),
		suffixes: z.array(suffixSchema)
	}),
	label: z.strictObject({category: categorySchema, failureKind: failureKindSchema.nullable(), accountHelps: accountHelpsSchema.nullable(), action: userActionSchema.nullable(), from: z.strictObject({failureKind: provenanceSchema, accountHelps: provenanceSchema, action: provenanceSchema})})
})
export type CatalogueSite = z.infer<typeof catalogueSiteSchema>

export const catalogueSchema = z.strictObject({
	schemaVersion: z.literal(1),
	ytDlp: z.strictObject({commit: z.string().regex(/^[0-9a-f]{40}$/), version: z.string().min(1), channel: z.enum(['nightly', 'stable']), manifestGeneratedAt: z.string().nullable()}),
	// A change to the generator alone (extractor, rules, report) changes the output
	// for the same commit, so the hash says which generator wrote the file.
	generator: z.strictObject({extractVersion: z.literal(1), hash: z.string().regex(/^[0-9a-f]{12}$/)}),
	sites: z.array(catalogueSiteSchema)
})
export type Catalogue = z.infer<typeof catalogueSchema>

function isRegExp(pattern: string): boolean {
	try {
		// eslint-disable-next-line security/detect-non-literal-regexp -- only compiles a maintainer's pattern from overrides.json to check it
		new RegExp(pattern)
		return true
	} catch {
		return false
	}
}

// A human label for sites the rules get wrong or leave empty. Every given
// field wins over every rule. `file` is a glob, `template` a regex.
export const overrideSchema = z.strictObject({
	name: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
	match: z.strictObject({id: z.string().optional(), file: z.string().optional(), call: z.string().optional(), template: z.string().refine(isRegExp, 'not a valid regular expression').optional()}).refine(match => Object.values(match).some(value => value !== undefined), 'an override must match on something'),
	label: z.strictObject({category: categorySchema.optional(), failureKind: failureKindSchema.nullable().optional(), accountHelps: accountHelpsSchema.optional(), action: userActionSchema.optional()}),
	note: z.string().min(1)
})
export type Override = z.infer<typeof overrideSchema>
export const overridesSchema = z.array(overrideSchema)

// One site per line, so a pin's diff reads line by line.
export function serializeCatalogue(catalogue: Catalogue): string {
	const head = `{"schemaVersion":${catalogue.schemaVersion},"ytDlp":${JSON.stringify(catalogue.ytDlp)},"generator":${JSON.stringify(catalogue.generator)},"sites":[`
	const sites = catalogue.sites.map(site => JSON.stringify(site)).join(',\n')
	return `${head}\n${sites}\n]}\n`
}
