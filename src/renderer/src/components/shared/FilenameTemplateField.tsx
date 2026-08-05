import {useCallback, useId, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {AlertTriangle} from 'lucide-react'
import {previewFilenameTemplate, templateHasId, type FilenameTemplateFailure} from '@shared/filenameTemplate.js'
import {FILENAME_TOKENS} from '@shared/schemas.js'
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
	'unknown-token': 'filenameTemplate.error.unknown-token'
} as const satisfies Record<FilenameTemplateFailure['code'], string>

export interface FilenameTemplateFieldProps {
	value: string
	onChange: (value: string) => void
	error: FilenameTemplateFailure | null
	label: string
	description: string
	placeholder?: string
	testId?: string
}

/**
 * Shared editor for a filename template — used by the global setting and by the
 * per-profile override. Token chips insert at the caret so most users never
 * type a brace.
 */
export function FilenameTemplateField({value, onChange, error, label, description, placeholder, testId}: FilenameTemplateFieldProps): React.JSX.Element {
	const {t} = useTranslation()
	const inputId = useId()
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

	const preview = error ? null : previewFilenameTemplate(value)
	// Only warn once the template is otherwise valid — an error message plus a
	// warning about the same input is noise.
	const showIdWarning = !error && value.trim() !== '' && !templateHasId(value)

	return (
		<Field className="gap-2">
			<FieldContent className="gap-0.5">
				<FieldLabel htmlFor={inputId} className="text-[13px] font-medium text-foreground">
					{label}
				</FieldLabel>
				<FieldDescription className="text-[11px] text-[var(--text-subtle)]">{description}</FieldDescription>
			</FieldContent>

			<Input id={inputId} ref={inputRef} value={value} placeholder={placeholder} onChange={event => onChange(event.target.value)} spellCheck={false} autoComplete="off" className="font-mono text-[12px]" data-testid={testId} aria-invalid={error !== null} />

			<div className="flex flex-wrap gap-1">
				{FILENAME_TOKENS.map(token => (
					<Button key={token} type="button" variant="outline" size="sm" className="h-6 px-2 font-mono text-[11px]" onClick={() => insertToken(token)} data-testid={`filename-token-${token}`}>
						{`{${token}}`}
					</Button>
				))}
			</div>

			{error ? (
				<p className="text-[11px] text-destructive" data-testid="filename-template-error">
					{t(ERROR_KEYS[error.code], {token: error.code === 'unknown-token' ? error.token : ''})}
				</p>
			) : preview ? (
				<p className="font-mono text-[11px] text-[var(--text-subtle)]" data-testid="filename-template-preview">
					{preview}
				</p>
			) : null}

			{showIdWarning ? (
				<p className="flex items-start gap-1.5 text-[11px] text-[var(--text-subtle)]" data-testid="filename-template-id-warning">
					<AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden />
					{t('filenameTemplate.idWarning')}
				</p>
			) : null}
		</Field>
	)
}
