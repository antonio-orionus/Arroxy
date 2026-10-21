import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {DownloadProfile} from '@shared/types.js'
import {useProfileDisplayName} from '@renderer/lib/profileName.js'
import {profileSummaryRows} from '@renderer/lib/profileSummary.js'

// A profile's hint: its name, then one labelled row per area.
export function ProfileSummaryContent({profile}: {profile: DownloadProfile}): ReactNode {
	const {t, i18n} = useTranslation()
	const nameOf = useProfileDisplayName()
	return (
		<div className="flex max-w-xs flex-col gap-1.5" data-testid={`profile-summary-${profile.id}`}>
			<span className="font-semibold">{nameOf(profile)}</span>
			<dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5">
				{profileSummaryRows(profile, t, i18n.language).map(row => (
					<div key={row.label} className="contents">
						<dt className="text-muted-foreground">{row.label}</dt>
						<dd className="wrap-anywhere">{row.value}</dd>
					</div>
				))}
			</dl>
		</div>
	)
}
