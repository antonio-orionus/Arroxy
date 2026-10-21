const listFormats = new Map<string, Intl.ListFormat>()

// Labels as one list in the UI language's own separators ("A, B and C").
export function formatList(items: readonly string[], uiLanguage: string, type: 'conjunction' | 'disjunction'): string {
	const key = `${type}:${uiLanguage}`
	let list = listFormats.get(key)
	if (!list) {
		// react-doctor-disable-next-line react-doctor/js-hoist-intl -- cached per UI language and type; locale is runtime data
		list = new Intl.ListFormat([uiLanguage, 'en'], {type})
		listFormats.set(key, list)
	}
	return list.format(items)
}
