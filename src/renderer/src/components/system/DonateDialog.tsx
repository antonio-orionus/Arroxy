import {useState, type ReactNode} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {Copy, CopyCheck} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {DONATION_ADDRESSES} from '@shared/constants.js'
import {Button} from '../ui/button.js'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '../ui/dialog.js'
import {useAppStore} from '../../store/useAppStore.js'
// The same QR images DONATE.md embeds; scripts/check-donation-addresses.mjs pins their hashes.
import btcQr from '../../../../../build/donate-btc.png'
import usdtQr from '../../../../../build/donate-tron.png'
import ethQr from '../../../../../build/donate-eth.png'

type DonationId = (typeof DONATION_ADDRESSES)[number]['id']

const QR_IMAGES: Record<DonationId, string> = {btc: btcQr, 'usdt-trc20': usdtQr, eth: ethQr}
const COPIED_RESET_MS = 1500

export function DonateDialog(): ReactNode {
	const {t} = useTranslation()
	const {donateDialogOpen, setDonateDialogOpen} = useAppStore(useShallow(state => ({donateDialogOpen: state.donateDialogOpen, setDonateDialogOpen: state.setDonateDialogOpen})))
	const [copiedId, setCopiedId] = useState<DonationId | null>(null)

	function handleOpenChange(open: boolean): void {
		if (!open) setCopiedId(null)
		setDonateDialogOpen(open)
	}

	function handleCopy(id: DonationId, address: string): void {
		void navigator.clipboard.writeText(address).then(() => {
			setCopiedId(id)
			setTimeout(() => setCopiedId(current => (current === id ? null : current)), COPIED_RESET_MS)
		})
	}

	return (
		<Dialog open={donateDialogOpen} onOpenChange={handleOpenChange}>
			<DialogContent data-testid="donate-dialog" className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
				<DialogHeader>
					<DialogTitle>{t('donate.title')}</DialogTitle>
					<DialogDescription>{t('donate.description')}</DialogDescription>
				</DialogHeader>

				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{DONATION_ADDRESSES.map(({id, label, network, address}) => {
						const copied = copiedId === id
						return (
							<section key={id} className="flex min-w-0 flex-col items-center gap-3 rounded-md border border-border-strong bg-muted/40 p-3" data-testid={`donate-${id}`}>
								<div className="text-center">
									<h3 className="text-sm font-semibold text-foreground">{label}</h3>
									<p className="text-caption text-muted-foreground">{network}</p>
								</div>
								<img src={QR_IMAGES[id]} alt={t('donate.qrAlt', {coin: label})} width={160} height={160} className="size-40 rounded-md p-1 qr-code-surface" draggable={false} />
								<code className="w-full break-all rounded-md bg-background/60 px-2 py-1.5 text-center font-mono text-xs text-foreground select-all" data-testid={`donate-${id}-address`}>
									{address}
								</code>
								<Button type="button" variant="outline" size="sm" className="mt-auto" onClick={() => handleCopy(id, address)} data-testid={`donate-${id}-copy`}>
									{copied ? <CopyCheck size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
									<span>{copied ? t('donate.copied') : t('donate.copyAddress')}</span>
								</Button>
							</section>
						)
					})}
				</div>

				<p className="text-caption text-muted-foreground">{t('donate.warning')}</p>
			</DialogContent>
		</Dialog>
	)
}
