// Build-time switches Vite reads from the environment into every bundle (main,
// preload, renderer). See dev-docs/release-flags.md.
interface ImportMetaEnv {
	readonly VITE_RELEASE_FLAGS?: string
}
