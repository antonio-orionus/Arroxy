import {type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {ExternalLink, Share2} from 'lucide-react'
import IconDiscord from '~icons/simple-icons/discord'
import {DISCORD_URL} from '@shared/constants.js'
import {Button} from '../ui/button.js'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '../ui/dialog.js'
import {useAppStore} from '../../store/useAppStore.js'
import appIcon from '../../assets/App-icon-HQ.png'

const WEBSITE_URL = 'https://arroxy.orionus.dev/'
const GITHUB_URL = 'https://github.com/antonio-orionus/Arroxy'
const NOTICES_URL = 'https://github.com/antonio-orionus/Arroxy/blob/main/THIRD_PARTY_NOTICES.txt'

function openExternalUrl(url: string): void {
	void window.appApi.shell.openExternal(url)
}

export function AboutDialog(): ReactNode {
	const {t} = useTranslation()
	const {aboutDialogOpen, setAboutDialogOpen, openShareDialog} = useAppStore()

	function handleShare(): void {
		setAboutDialogOpen(false)
		openShareDialog('about')
	}

	return (
		<Dialog open={aboutDialogOpen} onOpenChange={setAboutDialogOpen}>
			<DialogContent data-testid="about-dialog">
				<DialogHeader className="items-center text-center">
					<img src={appIcon} alt="" width={72} height={72} className="rounded-xl shadow-sm" draggable={false} />
					<DialogTitle className="text-lg">Arroxy</DialogTitle>
					<span className="text-xs text-muted-foreground tabular-nums">v{window.appVersion}</span>
					<DialogDescription className="text-center">{t('about.tagline')}</DialogDescription>
				</DialogHeader>

				<div className="flex flex-wrap gap-2 justify-center">
					<Button type="button" variant="outline" size="sm" onClick={() => openExternalUrl(WEBSITE_URL)} data-testid="about-link-website">
						{t('about.websiteLink')}
						<ExternalLink size={12} aria-hidden />
					</Button>
					<Button type="button" variant="outline" size="sm" onClick={() => openExternalUrl(GITHUB_URL)} data-testid="about-link-github">
						{t('about.githubLink')}
						<ExternalLink size={12} aria-hidden />
					</Button>
					<Button type="button" variant="outline" size="sm" onClick={() => openExternalUrl(DISCORD_URL)} data-testid="about-link-discord">
						Discord
						<IconDiscord width={12} height={12} aria-hidden />
					</Button>
					<Button type="button" variant="outline" size="sm" onClick={handleShare} data-testid="about-link-share">
						{t('share.shareAction')}
						<Share2 size={12} aria-hidden />
					</Button>
				</div>

				<div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
					<span>{t('about.licenseLine')}</span>
					<button type="button" onClick={() => openExternalUrl(NOTICES_URL)} className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground transition-colors" data-testid="about-link-notices">
						{t('about.thirdPartyNotices')}
						<ExternalLink size={11} aria-hidden />
					</button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
