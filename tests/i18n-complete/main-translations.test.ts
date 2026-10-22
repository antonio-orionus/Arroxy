import {describe, expect, it} from 'vite-plus/test'
import {mainT} from '@main/i18n.js'

describe('mainT in translated locales', () => {
	it('translates a known key', () => {
		expect(mainT('es', 'dialogs.quitWithActiveDownloads.keep')).toBe('Seguir descargando')
		expect(mainT('tr', 'dialogs.quitWithActiveDownloads.keep')).toBe('İndirmeye Devam Et')
		expect(mainT('pt', 'dialogs.quitWithActiveDownloads.keep')).toBe('Continuar Baixando')
		expect(mainT('ko', 'common.continue')).toBe('계속')
		expect(mainT('it', 'common.continue')).toBe('Continua')
		expect(mainT('pl', 'common.continue')).toBe('Kontynuuj')
		expect(mainT('fa', 'common.continue')).toBe('ادامه')
		expect(mainT('th', 'common.continue')).toBe('ดำเนินการต่อ')
		expect(mainT('zh-Hant', 'common.continue')).toBe('繼續')
	})
})
