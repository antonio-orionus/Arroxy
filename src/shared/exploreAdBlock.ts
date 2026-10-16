// The Explore ad blocker is on until the user turns it off (P2-R53): a setting
// never written (undefined) means on, and only an explicit false means off.
export function isExploreAdBlockOn(common: {readonly exploreAdBlock?: boolean | undefined}): boolean {
	return common.exploreAdBlock !== false
}
