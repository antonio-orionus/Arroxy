import {describe, expect, it} from 'vite-plus/test'
import {ytDlpExpandsPath, ytDlpExpandVars} from '@main/services/ytDlpPathExpansion.js'

// Expected values are CPython's own posixpath.expandvars / ntpath.expandvars
// output for this environment (variables matched case-sensitively there, so
// Windows' case-insensitive lookup has its own test).
const ENV = {HOME: '/home/u', ARROXY_PARITY: 'EXPANDED', USERPROFILE: 'C:\\Users\\u', A_1: 'one'}

const CASES: [input: string, posix: string, nt: string][] = [
	['/x/plain', '/x/plain', '/x/plain'],
	['/x/$HOME/y', '/x//home/u/y', '/x//home/u/y'],
	['/x/${HOME}y', '/x//home/uy', '/x//home/uy'],
	['/x/$HOMEy', '/x/$HOMEy', '/x/$HOMEy'],
	['/x/$$HOME', '/x/$/home/u', '/x/$HOME'],
	['/x/$1', '/x/$1', '/x/$1'],
	['/x/$', '/x/$', '/x/$'],
	['/x/$ dollar', '/x/$ dollar', '/x/$ dollar'],
	['/x/100$', '/x/100$', '/x/100$'],
	['/x/${}', '/x/${}', '/x/${}'],
	['/x/${unclosed', '/x/${unclosed', '/x/${unclosed'],
	['/x/%HOME%', '/x/%HOME%', '/x//home/u'],
	['/x/%%', '/x/%%', '/x/%'],
	['/x/50%', '/x/50%', '/x/50%'],
	['/x/%(id)s', '/x/%(id)s', '/x/%(id)s'],
	['/x/a%nope%b', '/x/a%nope%b', '/x/a%nope%b'],
	["/x/'$HOME'", "/x/'/home/u'", "/x/'$HOME'"],
	["/x/'unclosed $HOME", "/x/'unclosed /home/u", "/x/'unclosed $HOME"],
	['/x/$A_1-b', '/x/one-b', '/x/$A_1-b'],
	['/x/$A-1', '/x/$A-1', '/x/$A-1'],
	['/x/$ARROXY_PARITY', '/x/EXPANDED', '/x/EXPANDED'],
	['~/x', '~/x', '~/x'],
	['/x/～$HOME', '/x/～/home/u', '/x/～/home/u'],
	['/x/$USERPROFILE%', '/x/C:\\Users\\u%', '/x/C:\\Users\\u%']
]

describe('ytDlpExpandVars', () => {
	it.each(CASES)('%s matches posixpath.expandvars', (input, posix) => {
		expect(ytDlpExpandVars(input, 'darwin', ENV)).toBe(posix)
		expect(ytDlpExpandVars(input, 'linux', ENV)).toBe(posix)
	})

	it.each(CASES)('%s matches ntpath.expandvars', (input, _posix, nt) => {
		expect(ytDlpExpandVars(input, 'win32', ENV)).toBe(nt)
	})

	it('treats only names the environment owns as set', () => {
		const folder = '/media/$toString ${constructor} $__proto__ %valueOf%'
		expect(ytDlpExpandVars(folder, 'linux', {})).toBe(folder)
		expect(ytDlpExpandVars(folder, 'win32', {})).toBe(folder)
	})

	it('looks Windows variables up without regard to case, as os.environ does there', () => {
		expect(ytDlpExpandVars('C:\\x\\%home%\\$userprofile', 'win32', ENV)).toBe('C:\\x\\/home/u\\C:\\Users\\u')
		expect(ytDlpExpandVars('/x/$home', 'linux', ENV)).toBe('/x/$home')
	})
})

describe('ytDlpExpandsPath', () => {
	it('is false for a folder yt-dlp writes to as named', () => {
		for (const folder of ['/Users/u/Downloads', '/x/$notset', '/x/100$ & 50%', '/x/%(id)s', '/x/$HOMEy']) expect(ytDlpExpandsPath(folder, 'darwin', ENV)).toBe(false)
		expect(ytDlpExpandsPath('C:\\Users\\u\\Downloads\\50%', 'win32', ENV)).toBe(false)
	})

	it('is true for a set variable, a Windows sign pair, or a leading ~', () => {
		expect(ytDlpExpandsPath('/x/$HOME', 'darwin', ENV)).toBe(true)
		expect(ytDlpExpandsPath('C:\\x\\%USERPROFILE%', 'win32', ENV)).toBe(true)
		expect(ytDlpExpandsPath('C:\\x\\100%%', 'win32', ENV)).toBe(true)
		expect(ytDlpExpandsPath('C:\\x\\$$', 'win32', ENV)).toBe(true)
		expect(ytDlpExpandsPath('~/Downloads', 'linux', ENV)).toBe(true)
	})
})
