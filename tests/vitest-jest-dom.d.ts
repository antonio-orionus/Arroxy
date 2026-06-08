import type {TestingLibraryMatchers} from '@testing-library/jest-dom/matchers'

declare module 'vitest' {
	interface Assertion<T = any> extends TestingLibraryMatchers<T, T> {}
	interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> {}
}
