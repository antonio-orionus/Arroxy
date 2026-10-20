type DefinedFields<T> = {[K in keyof T]?: Exclude<T[K], undefined>}

// Drops undefined values so optional fields are absent rather than present-
// but-undefined (exactOptionalPropertyTypes).
export function definedFields<T extends Record<string, unknown>>(fields: T): DefinedFields<T> {
	const result: DefinedFields<T> = {}
	for (const key of Object.keys(fields) as (keyof T)[]) {
		const value = fields[key]
		if (value !== undefined) result[key] = value as Exclude<T[keyof T], undefined>
	}
	return result
}
