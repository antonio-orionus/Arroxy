// The Explore view's IPC payloads: what the renderer may ask of the native
// view (bounds, navigation, visibility) and what main sends back (link-menu
// picks, snapshots). Every one is validated at the IPC boundary.

import {z} from 'zod'
import {downloadProfileRefSchema} from './schemas.js'
import {EXPLORE_ADDRESS_MAX} from './sites/exploreAddress.js'

// Largest pixel extent the Explore view may be asked to cover; matches the compositor's texture ceiling.
const EXPLORE_BOUNDS_MAX = 16384
const exploreBoundsValueSchema = z.number().min(0).max(EXPLORE_BOUNDS_MAX)
export const exploreViewBoundsSchema = z.object({x: exploreBoundsValueSchema, y: exploreBoundsValueSchema, width: exploreBoundsValueSchema, height: exploreBoundsValueSchema})
export type ExploreViewBounds = z.infer<typeof exploreViewBoundsSchema>
// `address`: what the user typed in the address bar, normalised by the
// renderer; main loads it only on the site (exploreHandlers, P2-R45).
export const exploreNavigateCommandSchema = z.discriminatedUnion('kind', [
	z.strictObject({kind: z.literal('back')}),
	z.strictObject({kind: z.literal('forward')}),
	z.strictObject({kind: z.literal('reload')}),
	z.strictObject({kind: z.literal('home')}),
	z.strictObject({kind: z.literal('address'), url: z.string().min(1).max(EXPLORE_ADDRESS_MAX)})
])
export type ExploreNavigateCommand = z.infer<typeof exploreNavigateCommandSchema>
export const exploreSetVisibleSchema = z.object({visible: z.boolean()})
// Whether the Explore tab is the active tab (the view is muted while it is not).
export const exploreSetActiveSchema = z.object({active: z.boolean()})
// A pick in the Explore page's link menu, for the link right-clicked (main
// builds and shows the menu): `download` queues it with `profile` made the
// active profile first, or with the active one; `download-video` the same for
// the video a link names beside its list, with no question; `list` is one of
// the list dialog's answers (`first` takes the load limit when it runs);
// `interactive` opens the wizard.
const exploreLinkUrlSchema = z.string().min(1).max(EXPLORE_ADDRESS_MAX)
export const exploreLinkActionSchema = z.discriminatedUnion('kind', [
	z.strictObject({kind: z.literal('download'), url: exploreLinkUrlSchema, profile: downloadProfileRefSchema.optional()}),
	z.strictObject({kind: z.literal('download-video'), url: exploreLinkUrlSchema, profile: downloadProfileRefSchema.optional()}),
	z.strictObject({kind: z.literal('list'), url: exploreLinkUrlSchema, answer: z.enum(['background', 'first', 'pick'])}),
	z.strictObject({kind: z.literal('interactive'), url: exploreLinkUrlSchema})
])
export type ExploreLinkAction = z.infer<typeof exploreLinkActionSchema>
// A snapshot of the Explore view, shown in its place while an overlay hides it
// (P2-R35): a base64 JPEG data URL and nothing else (an SVG could carry
// script). Main encodes it at full device resolution, quality 85; the cap
// keeps one IPC reply bounded yet fits a noise-heavy page on a 5K display
// (~15M chars; a typical page is well under 1M).
export const EXPLORE_SNAPSHOT_MAX_CHARS = 16 * 1024 * 1024
export const exploreSnapshotSchema = z
	.string()
	.max(EXPLORE_SNAPSHOT_MAX_CHARS)
	.regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/)
