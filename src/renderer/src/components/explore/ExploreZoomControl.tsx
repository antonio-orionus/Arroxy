import {useRef, useState, type KeyboardEvent, type ReactNode} from 'react'
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
	// Resolves once the new zoom is saved (or the save failed).
	onChange: (zoom: number) => Promise<void>
}

const percentOf = (zoom: number): number => Math.round(zoom * 100)

// The page's zoom. The icon opens the controls in the toolbar row itself, not
// in a popup: a popup would hide the native view, and the page has to stay
// visible to show what the zoom does. A typed number applies on Enter or when
// the field is left; text that is no number puts the current zoom back.
export function ExploreZoomControl({zoom: savedZoom, onChange}: ExploreZoomControlProps): ReactNode {
	const {t} = useTranslation()
	// The zoom last asked for, until its save settles. Saves queue, and each one's
	// answer briefly puts back the zoom it carried, so steps and the field follow
	// this rather than the saved value: fast clicks add up instead of repeating.
	const [requested, setRequested] = useState<number | null>(null)
	const zoom = requested ?? savedZoom
	// Only the latest request may end the wait: an earlier save asking for the same value must not.
	const latestRequestRef = useRef(0)
	const [open, setOpen] = useState(false)
	const [draft, setDraft] = useState<string | null>(null)
	const label = t('explore.toolbar.zoom.label')

	function change(next: number): void {
		const request = ++latestRequestRef.current
		setRequested(next)
		void onChange(next).finally(() => {
			if (latestRequestRef.current === request) setRequested(null)
		})
	}

	function commit(): void {
		if (draft === null) return
		const parsed = parseExploreZoomPercent(draft)
		setDraft(null)
		if (parsed !== null && parsed !== zoom) change(parsed)
	}

	function onKeyDown(event: KeyboardEvent<HTMLElement>): void {
		// Enter belongs to the field; on a button it must still press it.
		if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
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
					<Button type="button" variant="outline" size="icon-sm" aria-label={t('explore.toolbar.zoom.out')} disabled={zoom <= EXPLORE_ZOOM_MIN} onClick={() => change(stepExploreZoom(zoom, -1))} data-testid="explore-zoom-out">
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
					<Button type="button" variant="outline" size="icon-sm" aria-label={t('explore.toolbar.zoom.in')} disabled={zoom >= EXPLORE_ZOOM_MAX} onClick={() => change(stepExploreZoom(zoom, 1))} data-testid="explore-zoom-in">
						<Plus aria-hidden />
					</Button>
					<Button type="button" variant="outline" size="icon-sm" aria-label={t('explore.toolbar.zoom.reset')} disabled={zoom === EXPLORE_ZOOM_DEFAULT} onClick={() => change(EXPLORE_ZOOM_DEFAULT)} data-testid="explore-zoom-reset">
						<RotateCcw aria-hidden />
					</Button>
				</ButtonGroup>
			) : null}
		</>
	)
}
