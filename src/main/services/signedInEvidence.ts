// What a failed signed-in launch says about the Explore sign-in (ADR 0022):
//   - accountRequired: a wall the account should open (private, members-only,
//     restricted to some audiences, a login wall);
//   - unknown: a failure nothing classified (a dead X session reads this way);
//   - accountWall: the site checking the account itself, a checkpoint or a
//     challenge, which stops signed-in work on the whole site;
//   - other: anything else (a rate limit, removed content, the network), which
//     says nothing about the sign-in.

import {escalationReason, type EscalationInput} from './exploreEscalation.js'

export type SignedInFailure = 'accountRequired' | 'unknown' | 'accountWall' | 'other'

const ACCOUNT_WALL = /\b(?:checkpoint|challenge)_required\b|your account (?:is|has been) (?:temporarily )?(?:locked|restricted|suspended)/i

export function signedInFailure(input: EscalationInput): SignedInFailure {
	const raw = input.stage === 'download' ? (input.rawError ?? '') : input.error.kind === 'ytdlp' ? input.error.error.raw : input.error.message
	if (ACCOUNT_WALL.test(raw)) return 'accountWall'
	const reason = escalationReason(input)
	if (reason !== null && reason !== 'botBlock') return 'accountRequired'
	const kind = input.stage === 'download' ? input.errorKind : input.error.kind === 'ytdlp' ? input.error.error.kind : null
	return kind === 'unknown' ? 'unknown' : 'other'
}
