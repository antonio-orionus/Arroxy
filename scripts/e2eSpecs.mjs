// Which Electron E2E specs gate CI. Every spec in the directory does, so a new
// one gates from the moment it exists; leaving it out has to be a deliberate
// entry below. Selecting by name prefix instead once kept every `profile-*`
// spec out of CI without anyone noticing.

export const E2E_SPEC_DIR = 'tests/e2e'

// Specs that drive a packaged build (`PACKAGED_EXE`) rather than `out/`, so
// they cannot run here. The cold-start workflow runs them.
export const PACKAGED_SPECS = Object.freeze(['startup-journeys.spec.ts'])

/** @param {readonly string[]} names file names in {@link E2E_SPEC_DIR} */
export function selectGatingSpecs(names) {
	return names
		.filter(name => name.endsWith('.spec.ts') && !PACKAGED_SPECS.includes(name))
		.toSorted()
		.map(name => `${E2E_SPEC_DIR}/${name}`)
}
