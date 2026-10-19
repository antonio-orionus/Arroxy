// The Explore ad blocker is off until the user turns it on: it breaks too many
// sites now that Explore browses the open web. A setting never written
// (undefined) means off; only an explicit true means on.
export function isExploreAdBlockOn(common: {readonly exploreAdBlock?: boolean | undefined}): boolean {
	return common.exploreAdBlock === true
}
