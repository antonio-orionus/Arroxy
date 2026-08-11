import {Toaster as Sonner, type ToasterProps} from 'sonner'

// Written by hand rather than pulled from the shadcn registry: that entry
// depends on `next-themes`, a Next.js library. App.tsx already resolves the
// theme itself (see resolveColorScheme) and passes the answer down, so the
// extra dependency would buy nothing.
export function Toaster(props: ToasterProps) {
	return <Sonner position="bottom-right" closeButton toastOptions={{classNames: {toast: 'chrome-glass border border-border text-foreground', description: 'text-muted-foreground', closeButton: 'border-[1.5px] border-[var(--border-strong)]'}}} {...props} />
}
