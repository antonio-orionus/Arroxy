import {useState, type KeyboardEvent, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Minus, Plus, RotateCcw, ZoomIn} from 'lucide-react'
import {EXPLORE_ZOOM_DEFAULT, EXPLORE_ZOOM_MAX, EXPLORE_ZOOM_MIN, parseExploreZoomPercent, stepExploreZoom} from '@shared/exploreZoom.js'
import {Button} from '../ui/button.js'
import {ButtonGroup} from '../ui/button-group.js'
import {Input} from '../ui/input.js'
import {Toggle} from '../ui/toggle.js'
import {Hint} from '../shared/Hint.js'

interface ExploreZoomControlProps {
	// The page's zoom as a factor (1 = 100%).
	zoom: number
	onChange: (zoom: number) => void
}

const percentOf = (zoom: number): number => Math.round(zoom * 100)

// The page's zoom. The icon opens the controls in the toolbar row itself, not
// in a popup: a popup would hide the native view, and the page has to stay
// visible to show what the zoom does. A typed number applies on Enter or when
// the field is left; text that is no number puts the current zoom back.
export function ExploreZoomControl({zoom, onChange}: ExploreZoomControlProps): ReactNode {
	const {t} = useTranslation()
	const [open, setOpen] = useState(false)
	const [draft, setDraft] = useState<string | null>(null)
	const label = t('explore.toolbar.zoom.label')

	function commit(): void {
		if (draft === null) return
		const parsed = parseExploreZoomPercent(draft)
		setDraft(null)
		if (parsed !== null && parsed !== zoom) onChange(parsed)
	}

	function onKeyDown(event: KeyboardEvent<HTMLElement>): void {
		if (event.key === 'Enter') {
			event.preventDefault()
			commit()
		} else if (event.key === 'Escape') {
			event.preventDefault()
			if (draft === null) setOpen(false)
			else setDraft(null)
		}
	}

	return (
		<>
			<Hint label={t('explore.toolbar.zoom.hint', {percent: percentOf(zoom)})}>
				<Toggle variant="outline" size="icon-sm" pressed={open} onPressedChange={setOpen} aria-label={label} data-testid="explore-zoom-toggle">
					<ZoomIn aria-hidden />
				</Toggle>
			</Hint>
			{open ? (
				<ButtonGroup role="group" aria-label={label} onKeyDown={onKeyDown} data-testid="explore-zoom-controls">
					<Button type="button" variant="outline" size="icon-sm" aria-label={t('explore.toolbar.zoom.out')} disabled={zoom <= EXPLORE_ZOOM_MIN} onClick={() => onChange(stepExploreZoom(zoom, -1))} data-testid="explore-zoom-out">
						<Minus aria-hidden />
					</Button>
					<Input
						type="text"
						inputMode="numeric"
						value={draft ?? `${percentOf(zoom)}%`}
						onChange={event => setDraft(event.target.value)}
						onFocus={event => event.target.select()}
						onBlur={commit}
						aria-label={t('explore.toolbar.zoom.percent')}
						className="h-7 w-16 rounded-none text-center tabular-nums"
						data-testid="explore-zoom-input"
					/>
					<Button type="button" variant="outline" size="icon-sm" aria-label={t('explore.toolbar.zoom.in')} disabled={zoom >= EXPLORE_ZOOM_MAX} onClick={() => onChange(stepExploreZoom(zoom, 1))} data-testid="explore-zoom-in">
						<Plus aria-hidden />
					</Button>
					<Button type="button" variant="outline" size="icon-sm" aria-label={t('explore.toolbar.zoom.reset')} disabled={zoom === EXPLORE_ZOOM_DEFAULT} onClick={() => onChange(EXPLORE_ZOOM_DEFAULT)} data-testid="explore-zoom-reset">
						<RotateCcw aria-hidden />
					</Button>
				</ButtonGroup>
			) : null}
		</>
	)
}
