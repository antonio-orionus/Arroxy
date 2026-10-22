// @vitest-environment node

import {describe, expect, it, vi} from 'vite-plus/test'
import {e2eTestSecretCipher, type SafeStorage, safeStorageCipher, safeStorageEncrypts} from '@main/control/clients/secretCipher.js'

// What encrypts a local client's secret: Electron's safeStorage when it
// really encrypts, and a marked test cipher in unpackaged E2E runs only.

function fakeSafeStorage(overrides: Partial<SafeStorage> = {}): SafeStorage {
	return {isEncryptionAvailable: () => true, getSelectedStorageBackend: () => 'gnome_libsecret', encryptString: plain => Buffer.from(`enc:${plain}`), decryptString: data => data.toString('utf8').replace(/^enc:/, ''), ...overrides}
}

describe('safeStorageEncrypts', () => {
	it('counts safeStorage only when it is available and, on Linux, not the hard-coded basic_text key', () => {
		expect(safeStorageEncrypts(fakeSafeStorage(), 'darwin')).toBe(true)
		expect(safeStorageEncrypts(fakeSafeStorage(), 'win32')).toBe(true)
		expect(safeStorageEncrypts(fakeSafeStorage(), 'linux')).toBe(true)
		expect(safeStorageEncrypts(fakeSafeStorage({isEncryptionAvailable: () => false}), 'darwin')).toBe(false)
		expect(safeStorageEncrypts(fakeSafeStorage({isEncryptionAvailable: () => false}), 'linux')).toBe(false)
		expect(safeStorageEncrypts(fakeSafeStorage({getSelectedStorageBackend: () => 'basic_text'}), 'linux')).toBe(false)
		expect(safeStorageEncrypts(fakeSafeStorage({getSelectedStorageBackend: () => 'kwallet6'}), 'linux')).toBe(true)
	})

	it('asks for the Linux backend only on Linux', () => {
		const getSelectedStorageBackend = vi.fn(() => 'basic_text' as const)
		expect(safeStorageEncrypts(fakeSafeStorage({getSelectedStorageBackend}), 'darwin')).toBe(true)
		expect(getSelectedStorageBackend).not.toHaveBeenCalled()
	})
})

describe('safeStorageCipher', () => {
	it('touches safeStorage only when used', () => {
		const isEncryptionAvailable = vi.fn(() => true)
		const cipher = safeStorageCipher(fakeSafeStorage({isEncryptionAvailable}), 'linux')
		expect(isEncryptionAvailable).not.toHaveBeenCalled()
		expect(cipher.available()).toBe(true)
		expect(cipher.decrypt(cipher.encrypt('secret'))).toBe('secret')
	})

	it('refuses to encrypt with the basic_text key', () => {
		const cipher = safeStorageCipher(fakeSafeStorage({getSelectedStorageBackend: () => 'basic_text'}), 'linux')
		expect(cipher.available()).toBe(false)
		expect(() => cipher.encrypt('secret')).toThrow()
	})
})

describe('e2eTestSecretCipher', () => {
	it('round-trips, and refuses data it did not make', () => {
		expect(e2eTestSecretCipher.available()).toBe(true)
		const data = e2eTestSecretCipher.encrypt('secret')
		expect(e2eTestSecretCipher.decrypt(data)).toBe('secret')
		expect(() => e2eTestSecretCipher.decrypt(Buffer.from('secret'))).toThrow()
	})
})
