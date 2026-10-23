// Why a failed probe or download is, or is not, retried with the user's Explore
// session. Logged once per failed run that could have escalated, so a new
// reason lands as one more enum value here.

import {z} from 'zod'

// Why a failed run was retried with the Explore session. Every reason but a
// bot wall is something only the account unlocks, so it reaches a playlist's
// items too; a bot wall signs in only the request that hit it.
const escalationReasonSchema = z.enum(['loginRequired', 'ageRestricted', 'accountOnlyVideo', 'accountOnlyPlaylist', 'playlistMissing', 'botBlock'])
export type EscalationReason = z.infer<typeof escalationReasonSchema>

// Why the Explore gate refused a run an account might have fixed: the cookie
// mode is not Explore, the Explore tab is turned off, downloads marked the
// site's sign-in as not working, or the session holds no sign-in cookies for
// the run's host.
const exploreGateRefusalSchema = z.enum(['notExploreMode', 'exploreDisabled', 'signInSuspect', 'noCookiesForHost'])
export type ExploreGateRefusal = z.infer<typeof exploreGateRefusalSchema>

// Why a failed probe or download was not retried with the Explore session: the
// gate refused it, the failure is one an account cannot fix, the URL has no
// host to scope cookies to, or the gate could not answer.
const escalationDeclineSchema = z.enum([...exploreGateRefusalSchema.options, 'notAccountFixable', 'noExploreScope', 'gateFailed'])
export type EscalationDecline = z.infer<typeof escalationDeclineSchema>

// Why a job starts anonymous rather than on the Explore session (ADR 0022):
// its site does not start signed in, the cookie mode is not Explore, the
// Explore tab is off, downloads marked the site's sign-in as not working, or
// the session holds no sign-in cookie for the site.
const startAnonymousReasonSchema = z.enum(['notSignInFirst', 'notExploreMode', 'exploreDisabled', 'signInSuspect', 'noSignInCookie'])
export type StartAnonymousReason = z.infer<typeof startAnonymousReasonSchema>
