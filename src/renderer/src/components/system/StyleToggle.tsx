import {useEffect, useState, type ReactNode} from 'react'
import {Sparkles, Square} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {type UiStyle, uiStyleSchema} from '@shared/schemas.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip.js'
import {useAppStore} from '../../store/useAppStore.js'
import {STYLES} from '../../styles/registry.js'
import {Hint} from '../shared/Hint.js'

const STYLE_ICONS = {aurora: Sparkles, minimal: Square} as const satisfies Record<UiStyle, typeof Sparkles>
const HINT_DELAY_MS = 1500
// Long enough to read, short enough that it never nags: the hint also goes
// away for good once it has been on screen this long.
const HINT_VISIBLE_MS = 12_000

// The footer's Aurora / Minimal switch. It also carries the one-time pointer
// that tells an updated user the look can be changed from here.
export function StyleToggle({hintReady}: {hintReady: boolean}): ReactNode {
	const {t} = useTranslation()
	const uiStyle = useAppStore(state => state.uiStyle)
	const setUiStyle = useAppStore(state => state.setUiStyle)
	const dismissStyleHint = useAppStore(state => state.dismissStyleHint)
	const hintPending = useAppStore(state => state.settings !== null && state.settings.common?.styleHintDismissed !== true)
	const [hintShown, setHintShown] = useState(false)

	useEffect(() => {
		if (!hintReady || !hintPending) return
		const show = setTimeout(() => setHintShown(true), HINT_DELAY_MS)
		return () => clearTimeout(show)
	}, [hintReady, hintPending])

	useEffect(() => {
		if (!hintShown) return
		const hide = setTimeout(() => void dismissStyleHint(), HINT_VISIBLE_MS)
		return () => clearTimeout(hide)
	}, [hintShown, dismissStyleHint])

	return (
		<Tooltip open={hintShown && hintPending}>
			<TooltipTrigger render={<div className="inline-flex" data-testid="footer-style-toggle" />}>
				<ToggleGroup
					value={[uiStyle]}
					onValueChange={values => {
						const next = uiStyleSchema.safeParse(values[0])
						if (!next.success) return
						setUiStyle(next.data)
						void dismissStyleHint()
					}}
					size="sm"
				>
					{uiStyleSchema.options.map(style => {
						const Icon = STYLE_ICONS[style]
						return (
							<Hint key={style} label={t(STYLES[style].labelKey)}>
								<ToggleGroupItem value={style} aria-label={t(STYLES[style].labelKey)} data-testid={`footer-style-${style}`}>
									<Icon className="size-3" />
								</ToggleGroupItem>
							</Hint>
						)
					})}
				</ToggleGroup>
			</TooltipTrigger>
			<TooltipContent side="top" data-testid="style-hint">
				{t('app.styleHint')}
			</TooltipContent>
		</Tooltip>
	)
}
