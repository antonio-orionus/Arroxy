import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Download, Info} from 'lucide-react'
import type {ExploreAddressHint as Hint} from '../../store/types.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Button} from '../ui/button.js'
import {exploreAddressHintText} from './exploreAddress.js'

// Under the toolbar after Enter on an address the view does not load
// (P2-R45). Its own row, so the view below shrinks rather than covers it.
// A web link on another site can be downloaded instead (its host is named);
// nothing here opens another browser. Not a live region itself: the tab
// keeps an always-mounted one (ExploreAddressHintLive) that announces it.
export function ExploreAddressHint({hint, onDownload, onDismiss}: {hint: Hint; onDownload: (url: string) => void; onDismiss: () => void}): ReactNode {
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
			{hint.kind === 'offsite' ? (
				<div className="col-start-2 mt-1.5 flex flex-wrap gap-2">
					<Button type="button" size="xs" title={hint.downloadUrl} onClick={() => onDownload(hint.downloadUrl)} data-testid="explore-address-hint-download">
						<Download data-icon="inline-start" aria-hidden />
						{t('explore.toolbar.offsiteDownload')}
					</Button>
				</div>
			) : null}
		</Alert>
	)
}

// Always mounted, so a screen reader announces the hint when it appears;
// empty while there is none. Visually hidden: the hint row shows the text.
export function ExploreAddressHintLive({hint}: {hint: Hint | null}): ReactNode {
	const {t} = useTranslation()
	return (
		<div role="status" aria-live="polite" className="sr-only" data-testid="explore-address-hint-live">
			{hint ? exploreAddressHintText(hint, t) : null}
		</div>
	)
}
