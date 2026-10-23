// The yt-dlp commit the message catalogue is built from: the yt-dlp users run.
// Reads the signed runtime manifest as the app does, takes its first yt-dlp
// entry (the one the app tries first, a nightly today), and resolves that
// release to the commit it was built from. Prints the pin as JSON:
//
//   bun scripts/ytdlp-catalogue/pin.ts
//   {"commit":"43a45ae…","version":"2026.10.21.233146","channel":"nightly","manifestGeneratedAt":"2026-10-22T13:00:31.439Z"}
//
// Set GITHUB_TOKEN to lift the GitHub API's anonymous rate limit.

import {verify} from 'node:crypto'
import {z} from 'zod'
import {RUNTIME_BINARY_INDEX_PUBLIC_KEY_PEM, RUNTIME_BINARY_INDEX_SIGNATURE_URL, RUNTIME_BINARY_INDEX_URL} from '../../src/main/services/binary/RuntimeBinaryTrust.js'
import {readRuntimeBinaryIndex, runtimeEntriesForCurrentTarget} from '../../src/shared/runtimeBinaryManifest.js'
import type {Catalogue} from './catalogue.js'

export type Pin = Catalogue['ytDlp']

export interface PinSources {
	fetchText: (url: string) => Promise<string>
	publicKeyPem?: string
}

const API = 'https://api.github.com/repos/yt-dlp'
const SHA = /^[0-9a-f]{40}$/
// The nightly builds repo says which yt-dlp commit each release was built from.
const GENERATED_FROM = /^Generated from: https:\/\/github\.com\/yt-dlp\/yt-dlp\/commit\/([0-9a-f]{40})\s*$/m

const releaseSchema = z.object({body: z.string().nullable()})
const commitSchema = z.object({sha: z.string().regex(SHA)})
const gitObjectSchema = z.object({object: z.object({sha: z.string().regex(SHA), type: z.string()})})

export async function resolvePin({fetchText, publicKeyPem = RUNTIME_BINARY_INDEX_PUBLIC_KEY_PEM}: PinSources): Promise<Pin> {
	const [raw, signature] = await Promise.all([fetchText(RUNTIME_BINARY_INDEX_URL), fetchText(RUNTIME_BINARY_INDEX_SIGNATURE_URL)])
	// As the app does: only a manifest signed with the bundled key is read.
	if (!verify(null, Buffer.from(raw), publicKeyPem, Buffer.from(signature.trim(), 'base64'))) throw new Error('runtime manifest signature does not verify')
	const read = readRuntimeBinaryIndex(JSON.parse(raw), 'linux', 'x64')
	if (!read.ok) throw new Error(`runtime manifest is invalid: ${read.issues.join('; ')}`)
	const first = runtimeEntriesForCurrentTarget(read.value, 'yt-dlp', 'linux', 'x64')[0]
	if (!first) throw new Error('runtime manifest has no yt-dlp entry')
	if (first.provider !== 'github' || !/^[\w.-]+$/.test(first.version)) throw new Error(`cannot resolve yt-dlp ${first.channel} ${first.version} from ${first.provider}`)
	const {channel} = first
	if (channel === 'default') throw new Error(`cannot resolve the yt-dlp ${channel} channel to a commit`)
	const commit = channel === 'nightly' ? await nightlyCommit(fetchText, first.version) : await tagCommit(fetchText, first.version)
	return {commit, version: first.version, channel, manifestGeneratedAt: read.value.generatedAt}
}

async function json<T>(fetchText: PinSources['fetchText'], url: string, schema: z.ZodType<T>): Promise<T> {
	return schema.parse(JSON.parse(await fetchText(url)))
}

async function nightlyCommit(fetchText: PinSources['fetchText'], tag: string): Promise<string> {
	const {body} = await json(fetchText, `${API}/yt-dlp-nightly-builds/releases/tags/${tag}`, releaseSchema)
	const commit = GENERATED_FROM.exec(body ?? '')?.[1]
	if (!commit) throw new Error(`yt-dlp nightly ${tag} names no commit it was built from`)
	// The release body is text anyone with write access there wrote: the commit
	// must exist in yt-dlp itself.
	const {sha} = await json(fetchText, `${API}/yt-dlp/commits/${commit}`, commitSchema)
	if (sha !== commit) throw new Error(`yt-dlp has no commit ${commit} (nightly ${tag})`)
	return commit
}

// A tag ref points at a commit, or at an annotated tag object that does.
async function tagCommit(fetchText: PinSources['fetchText'], tag: string): Promise<string> {
	let {object} = await json(fetchText, `${API}/yt-dlp/git/ref/tags/${tag}`, gitObjectSchema)
	if (object.type === 'tag') ({object} = await json(fetchText, `${API}/yt-dlp/git/tags/${object.sha}`, gitObjectSchema))
	if (object.type !== 'commit') throw new Error(`yt-dlp tag ${tag} points at a ${object.type}, not a commit`)
	return object.sha
}

// A plain fetch, with GITHUB_TOKEN on GitHub API calls when it is set.
export async function fetchText(url: string): Promise<string> {
	const token = process.env.GITHUB_TOKEN
	const api = url.startsWith('https://api.github.com/')
	const response = await fetch(url, {headers: api ? {Accept: 'application/vnd.github+json', ...(token ? {Authorization: `Bearer ${token}`} : {})} : {}})
	if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
	return response.text()
}

if (import.meta.main) process.stdout.write(`${JSON.stringify(await resolvePin({fetchText}))}\n`)
