import {z} from 'zod'
import {ffmpegPackageFormatSchema, runtimeBinaryArchSchema, runtimeBinaryChannelSchema, runtimeBinaryFormatSchema, runtimeBinaryIdSchema, runtimeBinaryPlatformSchema, runtimeBinaryProviderSchema} from './schemas.js'

// Shapes of the signed binary manifest. The enums they use live in schemas.ts.

export const runtimeBinaryManifestEntrySchema = z.object({
	id: runtimeBinaryIdSchema,
	channel: runtimeBinaryChannelSchema,
	provider: runtimeBinaryProviderSchema,
	version: z.string().trim().min(1),
	platform: runtimeBinaryPlatformSchema,
	arch: runtimeBinaryArchSchema,
	url: z.url(),
	mirrors: z.array(z.url()).default([]),
	size: z.number().int().positive(),
	sha256: z.string().regex(/^[a-f0-9]{64}$/),
	format: runtimeBinaryFormatSchema,
	executablePath: z.string().trim().min(1)
})
export type RuntimeBinaryManifestEntry = z.infer<typeof runtimeBinaryManifestEntrySchema>

// The index Arroxy 0.6.2 and earlier read. Its entry schema is closed: one
// entry of any other kind fails the whole index for those clients, so v1 only
// ever carries yt-dlp executables.
export const runtimeBinaryIndexV1Schema = z.object({schemaVersion: z.literal(1), generatedAt: z.iso.datetime({offset: true}), entries: z.array(runtimeBinaryManifestEntrySchema).min(1)})
export type RuntimeBinaryIndexV1 = z.infer<typeof runtimeBinaryIndexV1Schema>

const ffmpegPackageFileSchema = z.object({path: z.string().trim().min(1), size: z.number().int().nonnegative()})
const ffmpegPackageLinkSchema = z.object({path: z.string().trim().min(1), target: z.string().trim().min(1)})

// One approved FFmpeg build for one platform: ffmpeg, ffprobe and every library
// they load, shipped and installed together as a single archive.
export const ffmpegPackageEntrySchema = z.object({
	id: z.literal('ffmpeg'),
	version: z.string().trim().min(1),
	platform: runtimeBinaryPlatformSchema,
	arch: runtimeBinaryArchSchema,
	url: z.url(),
	mirrors: z.array(z.url()).default([]),
	size: z.number().int().positive(),
	sha256: z.string().regex(/^[a-f0-9]{64}$/),
	format: ffmpegPackageFormatSchema,
	ffmpegPath: z.string().trim().min(1),
	ffprobePath: z.string().trim().min(1),
	files: z.array(ffmpegPackageFileSchema).min(1),
	links: z.array(ffmpegPackageLinkSchema).default([])
})
export type FfmpegPackageEntry = z.infer<typeof ffmpegPackageEntrySchema>

// Entries stay unknown here: the index validator parses the kinds it knows and
// skips the rest, so a kind added later does not break this client the way an
// FFmpeg entry would break a v1 reader.
export const runtimeBinaryIndexEnvelopeSchema = z.object({schemaVersion: z.literal(2), generatedAt: z.iso.datetime({offset: true}), entries: z.array(z.unknown()).min(1)})

export type RuntimeBinaryIndexEntry = RuntimeBinaryManifestEntry | FfmpegPackageEntry
export interface RuntimeBinaryIndex {
	schemaVersion: 2
	generatedAt: string
	entries: RuntimeBinaryIndexEntry[]
}
