import {describe, expect, it} from 'vite-plus/test'
import {mainT} from '@main/i18n.js'

describe('mainT in translated locales', () => {
	it('translates a known key', () => {
		expect(mainT('es', 'dialogs.quitWithActiveDownloads.confirm')).toBe('Cancelar descargas y salir')
		expect(mainT('tr', 'dialogs.quitWithActiveDownloads.confirm')).toBe('İndirmeleri İptal Et ve Çık')
		expect(mainT('pt', 'dialogs.quitWithActiveDownloads.confirm')).toBe('Cancelar Downloads e Sair')
		expect(mainT('ko', 'common.continue')).toBe('계속')
		expect(mainT('it', 'common.continue')).toBe('Continua')
		expect(mainT('pl', 'common.continue')).toBe('Kontynuuj')
		expect(mainT('fa', 'common.continue')).toBe('ادامه')
		expect(mainT('th', 'common.continue')).toBe('ดำเนินการต่อ')
		expect(mainT('zh-Hant', 'common.continue')).toBe('繼續')
	})
})
