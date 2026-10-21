import {type ControlError, controlError} from './errors'

// Protocol majors this package describes. Within a major every change is
// additive: new optional fields, new methods, new event kinds.
export const CONTROL_PROTOCOL_MAJORS: readonly number[] = [1]

export type ProtocolNegotiation = {readonly ok: true; readonly major: number} | {readonly ok: false; readonly error: ControlError}

// hello refuses with version_unsupported when no major is shared; otherwise the
// highest major both sides speak comes back in the auth result.
export function negotiateProtocolMajor(clientMajors: readonly number[], serverMajors: readonly number[] = CONTROL_PROTOCOL_MAJORS): ProtocolNegotiation {
	const shared = clientMajors.filter(major => serverMajors.includes(major))
	if (shared.length > 0) return {ok: true, major: Math.max(...shared)}
	const details = {clientMajors: [...clientMajors], serverMajors: [...serverMajors]}
	return {ok: false, error: controlError('version_unsupported', `No common protocol major: client speaks ${clientMajors.join(', ')}, Arroxy speaks ${serverMajors.join(', ')}.`, {details})}
}
