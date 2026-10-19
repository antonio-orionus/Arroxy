import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useShallow} from 'zustand/react/shallow'
import {ChevronDown, Download, ListPlus} from 'lucide-react'
import {useAppStore} from '../../store/useAppStore.js'
import {blockerHintKey, singleDownloadBlocker} from '../../store/wizard/singleDownloadReadiness.js'
import {Button} from '../ui/button.js'
import {ButtonGroup} from '../ui/button-group.js'
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover.js'
import {Hint} from '../shared/Hint.js'

// The single-video split button: Download starts now (the priority lane), the
// menu adds to the queue without starting. Review's primary action, and an
// outline shortcut on Format, where Continue is the primary.
export function SingleDownloadActions({variant = 'glow'}: {variant?: 'glow' | 'outline'}): ReactNode {
	const {t} = useTranslation()
	const [menuOpen, setMenuOpen] = useState(false)
	const {blocker, submitting, addToQueue, addAndDownloadImmediately} = useAppStore(useShallow(state => ({blocker: singleDownloadBlocker(state), submitting: state.isSubmittingToQueue, addToQueue: state.addToQueue, addAndDownloadImmediately: state.addAndDownloadImmediately})))
	const disabled = blocker !== null || submitting
	const hintKey = blockerHintKey(blocker)

	return (
		<ButtonGroup aria-label={t('wizard.formats.footer.download')}>
			<Hint label={hintKey ? t(hintKey) : undefined}>
				<Button variant={variant} type="button" onClick={() => void addAndDownloadImmediately()} disabled={disabled} focusableWhenDisabled data-testid="btn-download">
					<Download data-icon="inline-start" />
					{t('wizard.formats.footer.download')}
				</Button>
			</Hint>
			<Popover open={menuOpen} onOpenChange={setMenuOpen}>
				<PopoverTrigger
					render={
						<Button variant={variant} type="button" size="icon" disabled={disabled} aria-label={t('wizard.formats.footer.moreActions')} data-testid="btn-download-menu">
							<ChevronDown />
						</Button>
					}
				/>
				<PopoverContent align="end" className="w-auto p-1">
					<Button
						type="button"
						variant="ghost"
						className="justify-start"
						onClick={() => {
							setMenuOpen(false)
							void addToQueue()
						}}
						data-testid="btn-add-to-queue"
					>
						<ListPlus data-icon="inline-start" />
						{t('wizard.formats.footer.addToQueue')}
					</Button>
				</PopoverContent>
			</Popover>
		</ButtonGroup>
	)
}
