import type {ReactNode} from 'react'
import {Languages} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {useAppStore} from '../../store/useAppStore.js'
import {SUPPORTED_LANGS, LANGUAGE_NATIVE_NAMES, type SupportedLang} from '@shared/i18n/index.js'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../ui/select.js'

function isSupportedLang(value: unknown): value is SupportedLang {
	return typeof value === 'string' && (SUPPORTED_LANGS as readonly string[]).includes(value)
}

export function LanguagePicker(): ReactNode {
	const {t} = useTranslation()
	const language = useAppStore(state => state.language)
	const setLanguage = useAppStore(state => state.setLanguage)

	return (
		<Select
			value={language}
			onValueChange={value => {
				if (isSupportedLang(value)) setLanguage(value)
			}}
		>
			<SelectTrigger variant="ghost" size="sm" aria-label={t('language.label')} title={t('language.label')} className="text-xs">
				<Languages className="size-3" aria-hidden />
				<SelectValue>{(value: unknown) => (isSupportedLang(value) ? LANGUAGE_NATIVE_NAMES[value] : null)}</SelectValue>
			</SelectTrigger>
			<SelectContent alignItemWithTrigger={false} side="top">
				{SUPPORTED_LANGS.map(code => (
					<SelectItem key={code} value={code}>
						{LANGUAGE_NATIVE_NAMES[code]}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
