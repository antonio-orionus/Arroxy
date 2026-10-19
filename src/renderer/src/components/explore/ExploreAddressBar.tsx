import {useRef, useState, type KeyboardEvent, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {ExploreSearchEngine} from '@shared/schemas.js'
import {exploreSearchEngineName} from '@shared/sites/exploreSearch.js'
import {Input} from '../ui/input.js'

interface ExploreAddressBarProps {
	// The page's address, shown whenever the user is not editing.
	url: string
	// Named in the placeholder: where plain text is searched.
	searchEngine: ExploreSearchEngine
	// Enter with text in the bar; resolves true when the view navigates.
	onSubmit: (text: string) => Promise<boolean>
	// The text changed, or Esc was pressed: whatever Enter last said is stale.
	onEdit: () => void
}

// P2-R45: an omnibox: any link opens, plain text searches the chosen engine. Focus selects the whole address so a
// paste replaces it; Esc or leaving the bar puts the page's address back.
// Nothing is judged while the user types: only Enter (see onSubmit).
export function ExploreAddressBar({url, searchEngine, onSubmit, onEdit}: ExploreAddressBarProps): ReactNode {
	const {t} = useTranslation()
	const [draft, setDraft] = useState<string | null>(null)
	// The mouse-up that ends a focusing click would collapse the selection.
	const keepSelectionRef = useRef(false)

	function submit(input: HTMLInputElement): void {
		const text = draft ?? url
		if (text.trim() === '') {
			setDraft(null)
			return
		}
		void onSubmit(text).then(navigated => {
			if (!navigated) return
			setDraft(null)
			input.blur()
		})
	}

	function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
		keepSelectionRef.current = false
		if (event.key === 'Enter') {
			// Enter while an input method is composing confirms the candidate (CJK), not the address.
			if (event.nativeEvent.isComposing) return
			event.preventDefault()
			submit(event.currentTarget)
		} else if (event.key === 'Escape') {
			event.preventDefault()
			setDraft(null)
			onEdit()
			event.currentTarget.select()
		}
	}

	return (
		<Input
			value={draft ?? url}
			placeholder={t('explore.toolbar.addressPlaceholder', {engine: exploreSearchEngineName(searchEngine)})}
			aria-label={t('explore.toolbar.addressAria')}
			dir="ltr"
			spellCheck={false}
			autoComplete="off"
			enterKeyHint="go"
			onFocus={event => {
				keepSelectionRef.current = true
				setDraft(url)
				event.currentTarget.select()
			}}
			onMouseUp={event => {
				if (!keepSelectionRef.current) return
				keepSelectionRef.current = false
				event.preventDefault()
			}}
			onBlur={() => {
				keepSelectionRef.current = false
				setDraft(null)
			}}
			onChange={event => {
				setDraft(event.target.value)
				onEdit()
			}}
			onKeyDown={onKeyDown}
			className="h-7 min-w-16 flex-1 basis-40 font-mono text-xs text-muted-foreground focus:text-foreground md:text-xs"
			data-testid="explore-address"
		/>
	)
}
