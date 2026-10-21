import {z} from 'zod'
import {downloadProfileRefSchema, probePlaylistModeSchema, webUrlSchema} from '@shared/schemas.js'

// Link intake (Control API step zero): taking a link in, probing it in the
// background and queueing what it finds runs in main. `window` is the app's
// own window (the Download button, Explore, a row's Retry or choice);
// `hotkey` the global hotkey.
export const intakeOriginKindSchema = z.enum(['window', 'hotkey'])
export type IntakeOriginKind = z.infer<typeof intakeOriginKindSchema>

// Stamped on a placeholder row in main and copied onto every row it becomes.
export const intakeOriginSchema = z.object({kind: intakeOriginKindSchema, clientId: z.string().min(1).optional(), intakeId: z.string().min(1)})
export type IntakeOrigin = z.infer<typeof intakeOriginSchema>

// The profile a placeholder row was placed with, and the folders it resolved
// against then. Stored on the row, so a reload or restart prepares it the same way.
export const pinnedDownloadProfileSchema = z.object({ref: downloadProfileRefSchema, outputContext: z.object({currentOutputDir: z.string().optional(), defaultOutputDir: z.string().optional()})})
export type PinnedDownloadProfile = z.infer<typeof pinnedDownloadProfileSchema>

// `requestId` names the call, so the window can match the outcome events to
// the request that caused them.
const intakeRequestIdSchema = z.string().min(1).max(128)
export const intakeAddInputSchema = z.object({requestId: intakeRequestIdSchema, url: webUrlSchema, playlistMode: probePlaylistModeSchema, title: z.string().max(2048).optional()})
export const intakeRetryInputSchema = z.object({requestId: intakeRequestIdSchema, itemId: z.string().min(1)})
// The answers a needs-choice row takes in main; Review stays in the window.
export const intakeTakeSchema = z.enum(['all', 'first'])
export type IntakeTake = z.infer<typeof intakeTakeSchema>
export const intakeChooseInputSchema = z.object({requestId: intakeRequestIdSchema, itemId: z.string().min(1), take: intakeTakeSchema})
export const intakeItemInputSchema = z.object({itemId: z.string().min(1)})
// What only the window knows and intake needs: the folder its wizard points
// at (a profile without a fixed folder downloads there) and whether its
// screen shows HDR (which settles the Auto HDR setting).
export const intakeWindowContextSchema = z.object({currentOutputDir: z.string(), displayShowsHdr: z.boolean()})
export type IntakeWindowContext = z.infer<typeof intakeWindowContextSchema>
