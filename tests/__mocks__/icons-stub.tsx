import type {SVGProps, ReactNode} from 'react'

// Inert stand-in for `~icons/*` virtual modules from `unplugin-icons`.
// The plugin generates real React components from icon sets at build time;
// vitest doesn't run that plugin, so ShareDialog and other consumers crash
// on import resolution. Stubbing keeps tests fast and side-effect-free.
export default function IconStub(props: SVGProps<SVGSVGElement>): ReactNode {
	return <svg aria-hidden {...props} />
}
