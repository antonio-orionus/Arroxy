import {downloadProfileRefFor} from '@shared/downloadProfiles.js'
import type {DownloadProfile, DownloadProfileRef} from '@shared/types.js'

// Assignments are stored as deviations from a baseline profile: a playlist
// item with no entry in the map implicitly uses the baseline, and only
// items the user explicitly redirected to a different profile get a key.
// `assignProfileToItems` relies on this invariant to prune entries that
// would otherwise duplicate the baseline.

export function sameProfileRef(a: DownloadProfileRef, b: DownloadProfileRef): boolean {
	return a.kind === b.kind && a.id === b.id
}

export function resolveAssignedProfile(itemId: string, assignments: Record<string, DownloadProfileRef>, profiles: DownloadProfile[], baseline: DownloadProfile): DownloadProfile {
	const ref = assignments[itemId]
	if (!ref) return baseline
	const resolved = profiles.find(profile => sameProfileRef(downloadProfileRefFor(profile, undefined), ref))
	return resolved ?? baseline
}

export function assignProfileToItems(assignments: Record<string, DownloadProfileRef>, itemIds: readonly string[], ref: DownloadProfileRef, baselineRef: DownloadProfileRef): Record<string, DownloadProfileRef> {
	const next = {...assignments}
	for (const itemId of itemIds) {
		if (sameProfileRef(ref, baselineRef)) {
			delete next[itemId]
		} else {
			next[itemId] = ref
		}
	}
	return next
}

export function clearAssignmentsForItems(assignments: Record<string, DownloadProfileRef>, itemIds: readonly string[]): Record<string, DownloadProfileRef> {
	const next = {...assignments}
	for (const itemId of itemIds) {
		delete next[itemId]
	}
	return next
}

export function profileAssignmentCounts(itemIds: readonly string[], assignments: Record<string, DownloadProfileRef>, profiles: DownloadProfile[], baselineRef: DownloadProfileRef): Map<string, number> {
	const baselineProfile = profiles.find(profile => sameProfileRef(downloadProfileRefFor(profile, undefined), baselineRef))
	const counts = new Map<string, number>()
	for (const itemId of itemIds) {
		const ref = assignments[itemId] ?? baselineRef
		const resolved = profiles.find(profile => sameProfileRef(downloadProfileRefFor(profile, undefined), ref)) ?? baselineProfile
		if (!resolved) continue
		counts.set(resolved.id, (counts.get(resolved.id) ?? 0) + 1)
	}
	return counts
}
