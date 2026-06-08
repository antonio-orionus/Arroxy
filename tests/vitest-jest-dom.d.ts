import type {TestingLibraryMatchers} from '@testing-library/jest-dom/matchers'

declare module 'vitest' {
	interface Assertion<T = unknown> extends TestingLibraryMatchers<T, T> {}
	interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, unknown> {}
}
