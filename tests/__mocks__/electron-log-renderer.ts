import {vi} from 'vitest'

const noop = vi.fn()

interface LogScope {
	info: typeof noop
	warn: typeof noop
	error: typeof noop
	debug: typeof noop
	verbose: typeof noop
	silly: typeof noop
}

function makeScope(): LogScope {
	return {info: noop, warn: noop, error: noop, debug: noop, verbose: noop, silly: noop}
}

const log = {...makeScope(), scope: vi.fn().mockImplementation(() => makeScope())}

export default log
