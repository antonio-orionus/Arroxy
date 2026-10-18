import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {FolderCheck, FolderSearch, Info, X} from 'lucide-react'
import {Button} from '../ui/button.js'
import {Alert, AlertAction, AlertDescription, AlertTitle} from '../ui/alert.js'
import type {PlaylistFolderSync} from './usePlaylistFolderSync.js'

export function PlaylistFolderScanStatus({sync}: {sync: PlaylistFolderSync}): ReactNode {
	const {t} = useTranslation()
	if (sync.scanState !== 'scanning') return null
	return (
		<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
			<FolderSearch size={13} />
			{t('wizard.playlist.syncScanning')}
		</p>
	)
}

function SyncDismissAction({onDismiss}: {onDismiss: () => void}): ReactNode {
	const {t} = useTranslation()
	return (
		<AlertAction>
			<Button type="button" variant="ghost" size="icon-sm" aria-label={t('titleBar.close')} onClick={onDismiss}>
				<X />
			</Button>
		</AlertAction>
	)
}

function SyncFoundAlert({sync}: {sync: PlaylistFolderSync}): ReactNode {
	const {t} = useTranslation()
	return (
		<Alert variant="success">
			<FolderCheck />
			<AlertTitle>{t('wizard.playlist.syncFoundTitle')}</AlertTitle>
			<AlertDescription>{t('wizard.playlist.syncFoundDesc', {n: sync.foundCount, dir: sync.syncDir})}</AlertDescription>
			<div className="col-start-2 mt-2.5 flex items-center gap-2">
				<Button type="button" size="sm" onClick={sync.apply}>
					{t('wizard.playlist.syncApply')}
				</Button>
				<Button type="button" variant="outline" size="sm" onClick={sync.changeFolder}>
					{t('wizard.playlist.syncChange')}
				</Button>
			</div>
			<SyncDismissAction onDismiss={sync.dismiss} />
		</Alert>
	)
}

function SyncNoneAlert({sync, noneDescKey}: {sync: PlaylistFolderSync; noneDescKey: 'wizard.playlist.syncNoneDesc' | 'wizard.playlist.syncNoneDescGeneric'}): ReactNode {
	const {t} = useTranslation()
	return (
		<Alert variant="info">
			<Info />
			<AlertTitle>{t('wizard.playlist.syncNoneTitle')}</AlertTitle>
			<AlertDescription>{t(noneDescKey, {dir: sync.syncDir})}</AlertDescription>
			<div className="col-start-2 mt-2.5">
				<Button type="button" variant="outline" size="sm" onClick={sync.changeFolder}>
					{t('wizard.playlist.syncChange')}
				</Button>
			</div>
			<SyncDismissAction onDismiss={sync.dismiss} />
		</Alert>
	)
}

export function PlaylistFolderSyncNotices({sync, noneDescKey}: {sync: PlaylistFolderSync; noneDescKey: 'wizard.playlist.syncNoneDesc' | 'wizard.playlist.syncNoneDescGeneric'}): ReactNode {
	if (sync.scanState !== 'done' || sync.dismissed) return null
	return sync.foundCount > 0 ? <SyncFoundAlert sync={sync} /> : <SyncNoneAlert sync={sync} noneDescKey={noneDescKey} />
}
