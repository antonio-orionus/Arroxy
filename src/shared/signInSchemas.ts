// How downloads use the Explore session on a site (ADR 0022).

import {z} from 'zod'

// How the Explore session is used on a site: never, when a failure needs it
// (escalation), first, or required.
export const signInPolicySchema = z.enum(['never', 'whenNeeded', 'first', 'required'])
export type SignInPolicy = z.infer<typeof signInPolicySchema>

// Why a job runs on the Explore session: its site starts signed in, or a
// failure an account can fix escalated it. Absent on stored rows: escalation,
// the only reason before ADR 0022.
export const authBasisSchema = z.enum(['siteDefault', 'escalation'])
export type AuthBasis = z.infer<typeof authBasisSchema>

// What a run showed about a site's sign-in, counted toward marking it as not
// working (SuspectSignIns) and kept with a mark.
export const signInEvidenceSchema = z.enum(['anonymousWorked', 'signedInUnknown', 'signedInSucceeded', 'accountWall', 'cookiesRejected'])
export type SignInEvidence = z.infer<typeof signInEvidenceSchema>
