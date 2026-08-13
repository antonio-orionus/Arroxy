// Shared guard for window-scoped keyboard shortcuts (playlist items/profiles
// steps' Delete/Backspace removal, the profiles step's digit-key assignment)
// so a shortcut key doesn't fire while the user is typing into a text field —
// the items step's range From/To inputs, or a profile name/path field inside
// the profile editor dialog the profiles step can open on top of itself.
//
// This only recognizes literal text-entry elements (input/textarea/
// contentEditable). It does NOT know whether a modal is open at all, so it
// does nothing for a dialog's buttons, toggles, or selects — a caller that
// wants shortcuts suppressed for an entire open dialog (see StepPlaylistProfiles's
// `editingProfile` check) must guard for that separately, on top of this.

export function isTypingTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false
	return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
}
