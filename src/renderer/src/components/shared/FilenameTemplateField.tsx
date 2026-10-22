import {useCallback, useId, useRef, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {AlertTriangle} from 'lucide-react'
import {previewFilenameTemplate, templateEndsWithBracketedId, type FilenameTemplateFailure} from '@shared/filenameTemplate.js'
import {FILENAME_TOKENS, PLAYLIST_FILENAME_TOKENS, type FilenameToken} from '@shared/schemas.js'
import {Button} from '../ui/button.js'
import {Field, FieldContent, FieldDescription, FieldLabel} from '../ui/field.js'
import {Input} from '../ui/input.js'

// Spelled out rather than templated so the keys stay literal types the typed
// i18n catalog can check.
const ERROR_KEYS = {
	empty: 'filenameTemplate.error.empty',
	'too-long': 'filenameTemplate.error.too-long',
	'forbidden-char': 'filenameTemplate.error.forbidden-char',
	'stray-brace': 'filenameTemplate.error.stray-brace',
	'no-unique-token': 'filenameTemplate.error.no-unique-token',
	'unknown-token': 'filenameTemplate.error.unknown-token',
	'empty-segment': 'filenameTemplate.error.empty-segment',
	'invalid-segment': 'filenameTemplate.error.invalid-segment',
	'resolution-in-dir': 'filenameTemplate.error.resolution-in-dir'
} as const satisfies Record<FilenameTemplateFailure['code'], string>

export interface FilenameTemplateFieldProps {
	value: string
	onChange: (value: string) => void
	error: FilenameTemplateFailure | null
	label: string
	description: string
	placeholder?: string
	testId?: string
	// For a template that only ever names one video: no playlist tokens, no
	// playlist preview, and no {id} warning, which is about playlist sync.
	singleVideo?: boolean
}

const playlistTokens: readonly FilenameToken[] = PLAYLIST_FILENAME_TOKENS
const SINGLE_VIDEO_TOKENS = FILENAME_TOKENS.filter(token => !playlistTokens.includes(token))

function FilenameTemplateError({id, error}: {id: string; error: FilenameTemplateFailure}): ReactNode {
	return (
		<p id={id} className="text-caption text-destructive" data-testid="filename-template-error">
			<FilenameTemplateErrorText error={error} />
		</p>
	)
}

// Why a template does not validate: under the field, and as the hint on an
// action the template blocks.
export function FilenameTemplateErrorText({error}: {error: FilenameTemplateFailure}): ReactNode {
	const {t} = useTranslation()
	return t(ERROR_KEYS[error.code], {token: error.code === 'unknown-token' ? error.token : ''})
}

// Rendered only for a valid template.
function FilenameTemplatePreview({value, singleVideo}: {value: string; singleVideo: boolean}): ReactNode {
	const {t} = useTranslation()
	const preview = previewFilenameTemplate(value, 'video')
	const playlistPreview = singleVideo ? null : previewFilenameTemplate(value, 'playlist')
	// A template can resolve differently in the two cases — folders built from
	// playlist metadata collapse for a single video. Showing both is the only way
	// the user sees that before downloading, so label them only when they differ.
	const previewsDiffer = preview !== null && playlistPreview !== null && preview !== playlistPreview
	if (!preview) return null
	return (
		<div className="flex flex-col gap-0.5">
			<p className="font-mono text-caption text-subtle-foreground" data-testid="filename-template-preview">
				{previewsDiffer ? `${t('filenameTemplate.previewSingle')}: ` : ''}
				{preview}
			</p>
			{previewsDiffer ? (
				<p className="font-mono text-caption text-subtle-foreground" data-testid="filename-template-preview-playlist">
					{`${t('filenameTemplate.previewPlaylist')}: `}
					{playlistPreview}
				</p>
			) : null}
		</div>
	)
}

/**
 * Shared editor for a filename template — used by the global setting, the
 * per-profile override and the single-video Review step. Token chips insert at
 * the caret so most users never type a brace.
 */
export function FilenameTemplateField({value, onChange, error, label, description, placeholder, testId, singleVideo = false}: FilenameTemplateFieldProps): React.JSX.Element {
	const {t} = useTranslation()
	const inputId = useId()
	const errorId = useId()
	const inputRef = useRef<HTMLInputElement>(null)

	const insertToken = useCallback(
		(token: string) => {
			const input = inputRef.current
			const snippet = `{${token}}`
			if (!input) {
				onChange(`${value}${snippet}`)
				return
			}
			const start = input.selectionStart ?? value.length
			const end = input.selectionEnd ?? value.length
			const next = `${value.slice(0, start)}${snippet}${value.slice(end)}`
			onChange(next)
			// Restore the caret after React re-renders with the new value.
			requestAnimationFrame(() => {
				input.focus()
				const caret = start + snippet.length
				input.setSelectionRange(caret, caret)
			})
		},
		[onChange, value]
	)

	// Only warn once the template is otherwise valid — an error message plus a
	// warning about the same input is noise.
	const showIdWarning = !singleVideo && !error && value.trim() !== '' && !templateEndsWithBracketedId(value)
	const tokens = singleVideo ? SINGLE_VIDEO_TOKENS : FILENAME_TOKENS

	return (
		<Field className="gap-2">
			<FieldContent className="gap-0.5">
				<FieldLabel htmlFor={inputId}>{label}</FieldLabel>
				<FieldDescription>{description}</FieldDescription>
			</FieldContent>

			<Input id={inputId} ref={inputRef} value={value} placeholder={placeholder} onChange={event => onChange(event.target.value)} spellCheck={false} autoComplete="off" className="font-mono text-xs" data-testid={testId} aria-invalid={error !== null} aria-describedby={error ? errorId : undefined} />

			<div className="flex flex-wrap gap-1">
				{tokens.map(token => (
					<Button key={token} type="button" variant="outline" size="xs" className="font-mono" onClick={() => insertToken(token)} data-testid={`filename-token-${token}`}>
						{`{${token}}`}
					</Button>
				))}
			</div>

			{error ? <FilenameTemplateError id={errorId} error={error} /> : <FilenameTemplatePreview value={value} singleVideo={singleVideo} />}

			{showIdWarning ? (
				<p className="flex items-start gap-1.5 text-caption text-subtle-foreground" data-testid="filename-template-id-warning">
					<AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden />
					{t('filenameTemplate.idEndingWarning')}
				</p>
			) : null}
		</Field>
	)
}
