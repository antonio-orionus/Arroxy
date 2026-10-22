import {useMemo, useRef, useState} from 'react'
import {downloadProfileOrigin} from '@shared/downloadProfiles.js'
import type {DownloadProfile, DownloadProfilesPrefs} from '@shared/types.js'
import type {DownloadHomeView} from '../../store/downloadHomeView.js'

export interface ProfileEditorState {
	editorOpen: boolean
	// Opens or closes the editor only while `sessionId` is still the current
	// session: a save or reset that finishes after its editor was cancelled
	// must not close an editor opened since.
	setSessionOpen: (sessionId: number, open: boolean) => void
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
	// The session callbacks compare against, current before any re-render.
	const sessionRef = useRef(0)
	const [editingProfile, setEditingProfile] = useState<DownloadProfile | null>(null)

	function openEditor(profile: DownloadProfile | null): void {
		sessionRef.current += 1
		setEditingProfile(profile)
		setEditorSessionId(sessionRef.current)
		setEditorOpen(true)
	}

	function setSessionOpen(sessionId: number, open: boolean): void {
		if (sessionId === sessionRef.current) setEditorOpen(open)
	}

	const editingProfileOrigin = editingProfile ? downloadProfileOrigin(editingProfile, profilesPrefs) : null
	const editorResetProfile = useMemo(
		() =>
			editingProfile && editingProfileOrigin?.kind === 'builtin'
				? {
						enabled: editingProfileOrigin.overridden,
						onReset: async () => {
							// A failed write resolves false, already rolled back: rejecting keeps
							// the editor open with its reset error.
							if (!(await removeDownloadProfile(editingProfile.id))) throw new Error('Profile settings were not reset')
						}
					}
				: undefined,
		[editingProfile, editingProfileOrigin, removeDownloadProfile]
	)

	return {editorOpen, setSessionOpen, editorSessionId, editingProfile, editorResetProfile, openEditor}
}
