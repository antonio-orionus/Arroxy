import {useEffect, useMemo, useState} from 'react'
import type {SiteCooldown} from '@shared/types.js'
import {siteKeyLabel} from '@shared/sites/siteKeys.js'
import {useAppStore} from '../../store/useAppStore.js'

// The site rate-limit cooldowns still running. Main pushes a cooldown when it
// starts or ends early, not when it runs out, so the earliest end is timed
// here and the list re-renders without it.
export function useRunningCooldowns(): SiteCooldown[] {
	const cooldowns = useAppStore(state => state.siteCooldowns)
	const [now, setNow] = useState(() => Date.now())
	const running = useMemo(() => cooldowns.filter(cooldown => Date.parse(cooldown.until) > now), [cooldowns, now])
	const nextEnd = running.reduce((earliest, cooldown) => Math.min(earliest, Date.parse(cooldown.until)), Number.POSITIVE_INFINITY)
	useEffect(() => {
		if (!Number.isFinite(nextEnd)) return
		const timer = window.setTimeout(() => setNow(Date.now()), Math.max(0, nextEnd - Date.now()))
		return () => window.clearTimeout(timer)
	}, [nextEnd])
	return running
}

// YouTube is one request site across its hosts; any other site is its hostname.
export function siteLabel(site: string): string {
	return siteKeyLabel(site)
}

// When a cooldown ends, as the user's clock shows it.
export function cooldownEndLabel(cooldown: SiteCooldown, language: string): string {
	return new Intl.DateTimeFormat(language, {hour: 'numeric', minute: '2-digit'}).format(new Date(cooldown.until))
}
