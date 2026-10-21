import type {SupportedLang} from '@shared/types.js'

// One Tally form per app language, all with the same questions, logic and
// hidden fields; Ek6M8B is the English master the others are translated from.
// Tally has no built-in language for am, km, my, om, sw and ur, so those forms
// show Tally's own messages (validation, thank-you page) in English, and ps
// borrows Persian for them so the form reads right to left. A language with no
// translated form yet opens the English master.
const FEEDBACK_FORM_IDS: Readonly<Partial<Record<SupportedLang, string>> & {en: string}> = {
	en: 'Ek6M8B',
	am: 'WJ9QAR',
	ar: 'X5l9De',
	bn: 'q5Zgb5',
	de: 'VpEq5N',
	el: 'Nq5EWN',
	es: 'dbqgxD',
	fa: '8No2Kk',
	fr: 'PRj45P',
	hi: 'Nq5EAp',
	id: 'KpQO6z',
	it: 'rDygAp',
	ja: '1WPOl4',
	km: 'aONkB2',
	ko: 'M1KPbE',
	my: '7Xljd2',
	om: 'bZVgl7',
	pl: 'jeDgQY',
	ps: '9NGxdX',
	pt: '4aXExd',
	ru: '2j8VNg',
	sr: 'Z95W6A',
	sw: 'ArPall',
	th: 'pex5Ky',
	tr: 'q5ZgA8',
	uk: 'xVxgaE',
	ur: 'Qo2jA1',
	uz: 'kbagyd',
	vi: 'LD1Vbz',
	zh: 'J1KG6z',
	'zh-Hant': 'yXZg66'
}

export function feedbackFormId(language: SupportedLang): string {
	return FEEDBACK_FORM_IDS[language] ?? FEEDBACK_FORM_IDS.en
}
