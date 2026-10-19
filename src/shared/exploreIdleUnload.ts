// Explore idle unload is off until the user turns it on: coming back to a
// released page costs a reload, a fair trade only when memory is short.
export function isExploreIdleUnloadOn(common: {readonly exploreIdleUnload?: boolean | undefined}): boolean {
	return common.exploreIdleUnload === true
}
