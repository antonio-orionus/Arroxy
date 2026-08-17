// Shared guards for window-scoped keyboard shortcuts (playlist items/profiles
// steps' Delete removal) so a shortcut key doesn't fire while the user is
// typing into a text field, or while some other overlay owns keyboard focus —
// the items step's range From/To inputs, the playlist-scope and probe-limit
// dialogs it can open on top of itself, or (on the profiles step) a profile
// name/path field inside the profile editor dialog.

export function isTypingTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false
	return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
}

// `isTypingTarget` only recognizes literal text-entry elements. It does
// nothing for a dialog's buttons/toggles, or a Base UI select popup's listbox
// — none of those are text fields, so a shortcut listener that only guards on
// `isTypingTarget` fires straight through an open overlay and mutates
// whatever is behind it. Base UI's Dialog.Popup renders role="dialog" (or
// "alertdialog"), its Select popup nests a role="listbox" list, and its Menu
// renders role="menu" — querying for those roles catches every overlay this
// wizard can open without each caller needing to track open/closed state
// itself. StepPlaylistProfiles instead tracks its one dialog via the
// `editingProfile` state flag it already has for other reasons; either
// approach is fine, this one is for callers that don't hold that state.
export function hasOpenOverlay(): boolean {
	return document.querySelector('[role="dialog"], [role="alertdialog"], [role="listbox"], [role="menu"]') !== null
}
