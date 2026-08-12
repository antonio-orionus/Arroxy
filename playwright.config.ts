import {defineConfig} from '@playwright/test'

// Each fixture test launches a real Electron app, so a worker costs far more
// than a browser context. Four keeps a laptop and a CI runner responsive while
// still cutting wall time several-fold; the suite is I/O-bound on downloads and
// app startup rather than CPU-bound.
const WORKERS = 4

export default defineConfig({
	testDir: './tests/e2e',
	timeout: 60_000,
	// Warms the shared runtime cache before any worker exists. Parallelism is
	// only safe because of this — see tests/e2e/globalSetup.ts.
	globalSetup: './tests/e2e/globalSetup.ts',
	fullyParallel: true,
	workers: WORKERS,
	reporter: 'list'
})
