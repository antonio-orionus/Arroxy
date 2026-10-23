import Store from 'electron-store'
import {z} from 'zod'
import type {SuspectSignInMark} from '@main/services/SuspectSignIns.js'

// The sites whose Explore sign-in downloads marked as not working, kept across
// restarts. Each mark holds a hash of the site's sign-in cookie, never its value.
const markSchema = z.object({site: z.string().min(1), cookieHash: z.string().min(1), since: z.string(), evidence: z.enum(['anonymousWorked', 'signedInUnknown', 'signedInSucceeded', 'accountWall', 'cookiesRejected'])})

// A malformed entry is dropped: an unreadable mark only means a site is tried signed in again.
export function parseSuspectSignInMarks(raw: unknown): SuspectSignInMark[] {
	return Array.isArray(raw) ? raw.flatMap(entry => markSchema.safeParse(entry).data ?? []) : []
}

export class SuspectSignInStore {
	private readonly store: Store<{marks: unknown}>

	constructor(userDataPath: string) {
		this.store = new Store<{marks: unknown}>({name: 'suspect-sign-ins', cwd: userDataPath, defaults: {marks: []}, clearInvalidConfig: true})
	}

	read(): SuspectSignInMark[] {
		return parseSuspectSignInMarks(this.store.get('marks'))
	}

	write(marks: SuspectSignInMark[]): void {
		this.store.set('marks', marks)
	}
}
