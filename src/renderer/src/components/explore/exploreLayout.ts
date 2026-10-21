import type {ExploreViewBounds} from '@shared/types.js'

// The native view paints over all DOM, so anything that floats above the page
// hides it: Base UI dialogs and popovers (role="dialog"/"alertdialog"), select
// lists and menus (which can open over the view, e.g. the footer language
// picker), the startup splash, and the Tally feedback popup (added to <body>
// with no role, removed on close). A popup kept mounted while closed sits in a
// `hidden` positioner and does not count.
const OVERLAY_SELECTOR = '[role="dialog"], [role="alertdialog"], [role="listbox"], [role="menu"], .splash-overlay, .tally-popup'

export function hasBlockingOverlay(): boolean {
	for (const element of document.querySelectorAll(OVERLAY_SELECTOR)) {
		if (element.closest('[hidden]') === null) return true
	}
	return false
}

// The placeholder's rect as the view must cover it: clipped by every scrolling
// or clipping ancestor and the window, so a scrolled-away part never paints
// over the title bar or footer. Viewport CSS px — `getBoundingClientRect`
// already includes the content wrapper's CSS `zoom`; main multiplies by the
// main window's zoom factor (Cmd/Ctrl +/-) to get DIP.
export function visibleBounds(element: HTMLElement): ExploreViewBounds {
	const rect = element.getBoundingClientRect()
	let left = rect.left
	let top = rect.top
	let right = rect.right
	let bottom = rect.bottom
	for (let node = element.parentElement; node; node = node.parentElement) {
		const style = getComputedStyle(node)
		if (style.overflowX === 'visible' && style.overflowY === 'visible') continue
		const clip = node.getBoundingClientRect()
		left = Math.max(left, clip.left)
		top = Math.max(top, clip.top)
		right = Math.min(right, clip.right)
		bottom = Math.min(bottom, clip.bottom)
	}
	left = Math.max(left, 0)
	top = Math.max(top, 0)
	right = Math.min(right, window.innerWidth)
	bottom = Math.min(bottom, window.innerHeight)
	return {x: left, y: top, width: Math.max(0, right - left), height: Math.max(0, bottom - top)}
}

// Toasts render in sonner's toaster at the window's bottom-right. The view must
// neither cover them nor hide for them (a clipboard toast while browsing would
// flicker the page), so the view's bottom edge stops above the highest toast
// that overlaps it. A toast fading out (`data-removed`) or hidden behind the
// stack (`data-visible="false"`) no longer counts.
const TOAST_SELECTOR = '[data-sonner-toaster] [data-sonner-toast]'
const TOAST_GAP = 8

export function boundsClearOfToasts(bounds: ExploreViewBounds): ExploreViewBounds {
	let bottom = bounds.y + bounds.height
	for (const toast of document.querySelectorAll(TOAST_SELECTOR)) {
		if (toast.getAttribute('data-visible') === 'false' || toast.getAttribute('data-removed') === 'true') continue
		const rect = toast.getBoundingClientRect()
		if (rect.width === 0 || rect.height === 0) continue
		const overlaps = rect.left < bounds.x + bounds.width && rect.right > bounds.x && rect.top < bounds.y + bounds.height && rect.bottom > bounds.y
		if (overlaps) bottom = Math.min(bottom, rect.top - TOAST_GAP)
	}
	return {...bounds, height: Math.max(0, bottom - bounds.y)}
}

export function sameBounds(a: ExploreViewBounds, b: ExploreViewBounds): boolean {
	return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
}
