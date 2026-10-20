import type {SupportedLang} from '@shared/types.js'

// One Tally form per app language, all with the same questions, logic and
// hidden fields; Ek6M8B is the English master the others are translated from.
// The map is total, so a new app language fails the type check until its form
// exists. Tally has no built-in language for am, km, my, om, sw and ur, so those
// forms show Tally's own messages (validation, thank-you page) in English; gl
// shows them in Spanish. ps borrows Persian for them so the form reads right to
// left, he is right to left too, and nb uses Tally's `no`.
const FEEDBACK_FORM_IDS: Readonly<Record<SupportedLang, string>> = {
	en: 'Ek6M8B',
	am: 'WJ9QAR',
	ar: 'X5l9De',
	bg: 'LDZP0y',
	bn: 'q5Zgb5',
	ca: 'pebDV1',
	cs: '1WA9Eg',
	da: 'yXPJD8',
	de: 'VpEq5N',
	el: 'Nq5EWN',
	es: 'dbqgxD',
	et: 'aOQ2GZ',
	eu: 'zEx7ek',
	fa: '8No2Kk',
	fi: 'o9b2ob',
	fr: 'PRj45P',
	gl: 'VpLzVj',
	he: 'GexRLe',
	hi: 'Nq5EAp',
	hr: '9Nq7lE',
	hu: '5XBZ2N',
	id: 'KpQO6z',
	it: 'rDygAp',
	ja: '1WPOl4',
	km: 'aONkB2',
	ko: 'M1KPbE',
	lt: '6D8ZxA',
	lv: 'bZ5WO6',
	my: '7Xljd2',
	nb: 'EqkxLl',
	nl: 'xVXJZd',
	om: 'bZVgl7',
	pl: 'jeDgQY',
	ps: '9NGxdX',
	pt: '4aXExd',
	ro: 'BEzxBe',
	ru: '2j8VNg',
	sk: 'QoK70Y',
	sl: 'e5qaEx',
	sr: 'Z95W6A',
	sv: 'q54RPO',
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
	return FEEDBACK_FORM_IDS[language]
}
