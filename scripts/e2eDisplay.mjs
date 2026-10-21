// Where the Electron E2E suite draws its window. Two problems get conflated
// here, so they are resolved separately:
//
//   ARROXY_E2E_HEADLESS  hides the window and stops it stealing focus, but
//                        still needs a display to exist.
//   xvfb-run             provides a display of its own.
//
// macOS and Windows run hidden so a suite run does not take over the screen; a
// hidden window there keeps drawing frames. Linux always runs under xvfb with a
// normal visible window, as CI does. A hidden window on a Linux desktop draws
// no frames (GNOME Wayland sends an unmapped window none), so requestAnimation
// Frame stops, transitions never end and every Playwright click waits forever
// for the element to be "stable". The visible window also keeps the clipboard
// spec, which skips itself in headless mode: ClipboardWatcher only polls while
// the window is focused and visible.

/**
 * @param {{platform: NodeJS.Platform, env: Record<string, string | undefined>, xvfbRunAvailable: boolean, playwrightArgs: readonly string[]}} input
 * @returns {{kind: 'run', command: string, args: string[], env: Record<string, string | undefined>, banner: string} | {kind: 'error', message: string}}
 */
export function planE2eRun({platform, env, xvfbRunAvailable, playwrightArgs}) {
	if (platform !== 'linux') {
		return {kind: 'run', command: 'bunx', args: [...playwrightArgs], env: {...env, ARROXY_E2E_HEADLESS: '1'}, banner: 'with a hidden window (no focus stealing)'}
	}
	if (!xvfbRunAvailable) {
		return {kind: 'error', message: 'Linux runs the E2E suite under xvfb, and xvfb-run is not installed.\nInstall it (e.g. `sudo apt-get install -y xvfb`): a hidden window on a Linux desktop draws no frames, so the suite cannot drive it.'}
	}
	const xvfbEnv = {...env}
	// Cleared, not merely unset: inheriting ARROXY_E2E_HEADLESS=1 from the caller
	// would hide the window again, the very thing this branch avoids.
	delete xvfbEnv.ARROXY_E2E_HEADLESS
	// xvfb-run points DISPLAY at its own server, but Electron picks Wayland when
	// either of these says the session is Wayland, and with no WAYLAND_DISPLAY
	// it finds the desktop's default socket on its own: the window would open on
	// the real screen.
	delete xvfbEnv.WAYLAND_DISPLAY
	delete xvfbEnv.XDG_SESSION_TYPE
	return {kind: 'run', command: 'xvfb-run', args: ['-a', 'bunx', ...playwrightArgs], env: xvfbEnv, banner: 'under xvfb'}
}
