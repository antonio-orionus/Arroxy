import {describe, expect, it} from 'vite-plus/test'
import {CONTROL_ERROR_CODES, CONTROL_EVENT_NAMES, CONTROL_METHOD_NAMES, controlJsonSchemas} from '../src/index'

describe('controlJsonSchemas', () => {
	const schemas = controlJsonSchemas()

	it('exports every method, event and the envelope as JSON Schema', () => {
		expect(Object.keys(schemas.methods).sort()).toEqual([...CONTROL_METHOD_NAMES].sort())
		expect(Object.keys(schemas.events).sort()).toEqual([...CONTROL_EVENT_NAMES].sort())
		for (const {params, result} of Object.values(schemas.methods)) {
			expect(params.$schema).toBe('https://json-schema.org/draft/2020-12/schema')
			expect(result.$schema).toBe('https://json-schema.org/draft/2020-12/schema')
		}
		expect(schemas.envelope.$schema).toBe('https://json-schema.org/draft/2020-12/schema')
	})

	it('serialises to plain JSON', () => {
		expect(JSON.parse(JSON.stringify(schemas))).toEqual(schemas)
	})

	it('keeps payloads open to unknown fields and the envelope closed', () => {
		expect(schemas.methods['queue.get'].params.additionalProperties).not.toBe(false)
		expect(schemas.methods['queue.get'].result.additionalProperties).not.toBe(false)
		expect(JSON.stringify(schemas.envelope)).toContain('"additionalProperties":false')
	})

	it('lists the error table with each code', () => {
		expect(Object.keys(schemas.errors).sort()).toEqual([...CONTROL_ERROR_CODES].sort())
		expect(schemas.protocolMajors).toEqual([1])
	})
})
