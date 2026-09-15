import {spawnSync} from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it} from 'vitest'

describe('app i18n unused-key checker', () => {
	it('recognizes referenced keys with numeric and hyphenated path segments', async () => {
		const root = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-i18n-unused-'))

		try {
			await fs.mkdir(path.join(root, 'scripts'), {recursive: true})
			await fs.mkdir(path.join(root, 'src/shared/i18n/locales'), {recursive: true})
			await fs.copyFile(path.join(process.cwd(), 'scripts/check-app-i18n-unused.ts'), path.join(root, 'scripts/check-app-i18n-unused.ts'))
			await fs.writeFile(path.join(root, 'src/shared/i18n/locales/en.json'), JSON.stringify({quality: {'128': '128 kbps'}, error: {'too-long': 'Too long'}}))
			await fs.writeFile(path.join(root, 'src/references.ts'), "t('quality.128')\nt('error.too-long')\n")

			const result = spawnSync(process.platform === 'win32' ? 'bun.exe' : 'bun', [path.join(root, 'scripts/check-app-i18n-unused.ts'), '--strict'], {encoding: 'utf8'})

			expect(result.status, `${result.stdout}${result.stderr}`).toBe(0)
			expect(result.stdout).toContain('No unused en keys found')
		} finally {
			await fs.rm(root, {recursive: true, force: true})
		}
	})
})
