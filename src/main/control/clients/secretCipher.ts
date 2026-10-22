// What encrypts a local client's secret at rest. The handshake keys an HMAC
// with the secret, so the file must hold the secret itself; the cipher keeps
// it out of the clear. Injected, so tests never reach Electron or the keychain.

export interface SecretCipher {
	// Whether a secret written now would really be encrypted.
	available(): boolean
	encrypt(plain: string): Buffer
	decrypt(data: Buffer): string
}

// Electron's safeStorage, as far as the cipher uses it.
export interface SafeStorage {
	isEncryptionAvailable(): boolean
	getSelectedStorageBackend(): 'basic_text' | 'gnome_libsecret' | 'kwallet' | 'kwallet5' | 'kwallet6' | 'unknown'
	encryptString(plain: string): Buffer
	decryptString(data: Buffer): string
}

// On Linux with no keyring safeStorage falls back to basic_text, a key hard-
// coded in Chromium: as good as plaintext, so it counts as unavailable.
export function safeStorageEncrypts(safeStorage: Pick<SafeStorage, 'isEncryptionAvailable' | 'getSelectedStorageBackend'>, platform: NodeJS.Platform): boolean {
	if (!safeStorage.isEncryptionAvailable()) return false
	return platform !== 'linux' || safeStorage.getSelectedStorageBackend() !== 'basic_text'
}

// safeStorage needs the app to be ready; nothing here calls it before use.
export function safeStorageCipher(safeStorage: SafeStorage, platform: NodeJS.Platform): SecretCipher {
	const available = (): boolean => safeStorageEncrypts(safeStorage, platform)
	return {
		available,
		encrypt: plain => {
			if (!available()) throw new Error('safeStorage cannot encrypt here')
			return safeStorage.encryptString(plain)
		},
		decrypt: data => safeStorage.decryptString(data)
	}
}

const E2E_TEST_MARK = 'arroxy-e2e-test-cipher:'

// NOT ENCRYPTION. Unpackaged E2E runs only: they must never reach the
// keychain (a dialog on the desktop) and Linux CI has no keyring. A packaged
// build never gets it, whatever its environment.
export const e2eTestSecretCipher: SecretCipher = {
	available: () => true,
	encrypt: plain => Buffer.from(`${E2E_TEST_MARK}${plain}`, 'utf8'),
	decrypt: data => {
		const text = data.toString('utf8')
		if (!text.startsWith(E2E_TEST_MARK)) throw new Error('not made by the E2E test cipher')
		return text.slice(E2E_TEST_MARK.length)
	}
}
