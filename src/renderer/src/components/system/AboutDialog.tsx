import {type JSX} from 'react'
import {useTranslation} from 'react-i18next'
import {ExternalLink, Share2} from 'lucide-react'
import {Button} from '../ui/button.js'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '../ui/dialog.js'
import {useAppStore} from '../../store/useAppStore.js'
import appIcon from '../../assets/App-icon-HQ.png'

const WEBSITE_URL = 'https://arroxy.orionus.dev/'
const GITHUB_URL = 'https://github.com/antonio-orionus/Arroxy'
const NOTICES_URL = 'https://github.com/antonio-orionus/Arroxy/blob/main/THIRD_PARTY_NOTICES.txt'

export function AboutDialog(): JSX.Element {
	const {t} = useTranslation()
	const {aboutDialogOpen, setAboutDialogOpen, openShareDialog} = useAppStore()

	function open(url: string): void {
		void window.appApi.shell.openExternal(url)
	}

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

				<div className="flex gap-2 justify-center">
					<Button type="button" variant="outline" size="sm" onClick={() => open(WEBSITE_URL)} data-testid="about-link-website">
						{t('about.websiteLink')}
						<ExternalLink size={12} aria-hidden />
					</Button>
					<Button type="button" variant="outline" size="sm" onClick={() => open(GITHUB_URL)} data-testid="about-link-github">
						{t('about.githubLink')}
						<ExternalLink size={12} aria-hidden />
					</Button>
					<Button type="button" variant="outline" size="sm" onClick={handleShare} data-testid="about-link-share">
						{t('share.shareAction')}
						<Share2 size={12} aria-hidden />
					</Button>
				</div>

				<div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
					<span>{t('about.licenseLine')}</span>
					<button type="button" onClick={() => open(NOTICES_URL)} className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground transition-colors" data-testid="about-link-notices">
						{t('about.thirdPartyNotices')}
						<ExternalLink size={11} aria-hidden />
					</button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
