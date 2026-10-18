import {useMemo, useState} from 'react'
import {downloadProfileOrigin} from '@shared/downloadProfiles.js'
import type {DownloadProfile, DownloadProfilesPrefs} from '@shared/types.js'
import type {DownloadHomeView} from '../../store/downloadHomeView.js'

export interface ProfileEditorState {
	editorOpen: boolean
	setEditorOpen: (open: boolean) => void
	editorSessionId: number
	editingProfile: DownloadProfile | null
	editorResetProfile: {enabled: boolean; onReset: () => Promise<void>} | undefined
	openEditor: (profile: DownloadProfile | null) => void
}

// Which profile the editor is open on. Each open starts a new session so the
// editor remounts with a fresh draft.
export function useProfileEditor({initialBrowserMockScenario, profilesPrefs, removeDownloadProfile}: {initialBrowserMockScenario: string | null; profilesPrefs: DownloadProfilesPrefs | undefined; removeDownloadProfile: DownloadHomeView['removeDownloadProfile']}): ProfileEditorState {
	const [editorOpen, setEditorOpen] = useState(() => initialBrowserMockScenario === 'profiles-editor')
	const [editorSessionId, setEditorSessionId] = useState(0)
	const [editingProfile, setEditingProfile] = useState<DownloadProfile | null>(null)

	function openEditor(profile: DownloadProfile | null): void {
		setEditingProfile(profile)
		setEditorSessionId(value => value + 1)
		setEditorOpen(true)
	}

	const editingProfileOrigin = editingProfile ? downloadProfileOrigin(editingProfile, profilesPrefs) : null
	const editorResetProfile = useMemo(
		() =>
			editingProfile && editingProfileOrigin?.kind === 'builtin'
				? {
						enabled: editingProfileOrigin.overridden,
						onReset: async () => {
							await removeDownloadProfile(editingProfile.id)
						}
					}
				: undefined,
		[editingProfile, editingProfileOrigin, removeDownloadProfile]
	)

	return {editorOpen, setEditorOpen, editorSessionId, editingProfile, editorResetProfile, openEditor}
}
