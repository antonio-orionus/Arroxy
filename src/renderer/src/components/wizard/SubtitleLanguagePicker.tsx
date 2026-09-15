import {useMemo, useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {buildSubtitleLanguageOptions, subtitleLanguageChoices} from '@renderer/lib/subtitleLanguageCatalog.js'
import {Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor} from '../ui/combobox.js'

interface SubtitleLanguagePickerProps {
	id: string
	value: readonly string[]
	onValueChange: (languages: string[]) => void
	invalid?: boolean
	describedBy?: string
}

export function SubtitleLanguagePicker({id, value, onValueChange, invalid = false, describedBy}: SubtitleLanguagePickerProps): ReactNode {
	const {t, i18n} = useTranslation()
	const anchor = useComboboxAnchor()
	const [query, setQuery] = useState('')
	const options = useMemo(() => buildSubtitleLanguageOptions(i18n.language), [i18n.language])
	const optionsByCode = useMemo(() => new Map(options.map(option => [option.code, option])), [options])

	// Ranked by the catalog rather than the combobox's substring filter, so `he`
	// finds Hebrew (`iw`) and exact codes outrank name matches.
	const items = subtitleLanguageChoices(options, query)
	const labelFor = (code: string): string => optionsByCode.get(code)?.label ?? code

	return (
		<Combobox multiple autoHighlight items={items} filter={null} value={[...value]} onValueChange={onValueChange} inputValue={query} onInputValueChange={setQuery} itemToStringLabel={labelFor}>
			<ComboboxChips ref={anchor} className="min-h-10" data-testid="profiles-editor-subtitle-languages">
				<ComboboxValue>
					{(codes: string[]) => (
						<>
							{codes.map(code => (
								<ComboboxChip key={code} removeLabel={t('wizard.profileEditor.action.removeLanguage', {code: labelFor(code)})} className="text-[12px]">
									{labelFor(code)}
									<span className="text-[11px] font-normal text-[var(--text-subtle)]">{code}</span>
								</ComboboxChip>
							))}
							<ComboboxChipsInput id={id} aria-invalid={invalid || undefined} aria-describedby={describedBy} placeholder={codes.length === 0 ? t('wizard.profileEditor.note.searchLanguages') : undefined} className="text-[12px]" />
						</>
					)}
				</ComboboxValue>
			</ComboboxChips>
			<ComboboxContent anchor={anchor}>
				<ComboboxEmpty>{t('wizard.profileEditor.note.noLanguageMatches')}</ComboboxEmpty>
				<ComboboxList>
					{(code: string) => {
						const option = optionsByCode.get(code)
						return (
							<ComboboxItem key={code} value={code} className="text-[12px]" data-testid={`profiles-editor-subtitle-language-option-${code}`}>
								{option ? (
									<>
										<span className="min-w-0 truncate">{option.label}</span>
										{option.nativeName !== option.label ? <span className="min-w-0 truncate text-[var(--text-subtle)]">{option.nativeName}</span> : null}
										<span className="ms-auto shrink-0 text-[11px] text-[var(--text-subtle)]">{code}</span>
									</>
								) : (
									t('wizard.profileEditor.action.useLanguageCode', {code})
								)}
							</ComboboxItem>
						)
					}}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	)
}
