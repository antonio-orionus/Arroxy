// Which of the Format switch's download types the wizard's picks amount to.

import {FORMAT_MODES, type FormatMode} from '@shared/schemas.js'
import type {AppState} from '../types.js'

export function isFormatMode(value: unknown): value is FormatMode {
	return typeof value === 'string' && (FORMAT_MODES as readonly string[]).includes(value)
}

type ModeFields = Pick<AppState, 'wizardMediaKind' | 'audioSelection' | 'selectedVideoFormatId' | 'wizardFormats'>

export function formatMode(state: ModeFields): FormatMode {
	if (state.wizardMediaKind !== 'video') return state.wizardMediaKind
	const video = state.wizardFormats.find(format => format.formatId === state.selectedVideoFormatId)
	return state.audioSelection.kind === 'none' && video?.isVideoOnly === true ? 'video-only' : 'video'
}
