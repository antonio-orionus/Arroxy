import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Info} from 'lucide-react'
import type {ExploreAddressHint as AddressHint} from '../../store/types.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {exploreAddressHintText} from './exploreAddress.js'

// Under the toolbar after Enter on an address the view does not load. Its own
// row, so the view below shrinks rather than covers it. Not a live region
// itself: the tab keeps an always-mounted one (ExploreAddressHintLive) that
// announces it.
export function ExploreAddressHint({hint, onDismiss}: {hint: AddressHint; onDismiss: () => void}): ReactNode {
	const {t} = useTranslation()
	return (
		<Alert
			role="note"
			variant="info"
			size="sm"
			data-testid="explore-address-hint"
			onKeyDown={event => {
				if (event.key === 'Escape') onDismiss()
			}}
		>
			<Info aria-hidden />
			<AlertDescription className="wrap-anywhere">{exploreAddressHintText(hint, t)}</AlertDescription>
		</Alert>
	)
}

// Always mounted, so a screen reader announces the hint when it appears;
// empty while there is none. Visually hidden: the hint row shows the text.
export function ExploreAddressHintLive({hint}: {hint: AddressHint | null}): ReactNode {
	const {t} = useTranslation()
	return (
		<div role="status" aria-live="polite" className="sr-only" data-testid="explore-address-hint-live">
			{hint ? exploreAddressHintText(hint, t) : null}
		</div>
	)
}
