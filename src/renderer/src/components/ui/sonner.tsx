import {Toaster as Sonner, type ToasterProps} from 'sonner'

// Written by hand rather than pulled from the shadcn registry. The registry
// entry does not compile here: it imports `IconPlaceholder` from
// `@/app/(create)/components/icon-placeholder`, a shadcn-site-internal
// component for previewing several icon libraries, and that path does not
// exist in this repo. It also carries a `"use client"` directive (meaningless
// outside Next.js) and reads the theme from `next-themes`, while App.tsx
// already resolves the theme itself (see resolveColorScheme) and passes the
// answer down. The parts of it worth having — the custom-property theming and
// the radius token — are kept below.

// The app footer is 32px tall (`h-8`) and sonner's default bottom offset is 24,
// which put the toast 8px *over* the footer controls. Measured, not guessed.
const FOOTER_CLEARANCE = 44

export function Toaster(props: ToasterProps) {
	return (
		<Sonner
			position="bottom-right"
			offset={FOOTER_CLEARANCE}
			closeButton
			// Sonner v2 colors itself from these custom properties. Setting them is
			// the supported way to theme it — a background rule delivered through
			// `classNames` loses to sonner's own stylesheet, which is why the toast
			// rendered flat white and flat black instead of picking up the app's
			// surface tokens.
			style={{'--normal-bg': 'var(--popover)', '--normal-text': 'var(--popover-foreground)', '--normal-border': 'var(--border)', '--border-radius': 'var(--radius)'} as React.CSSProperties}
			toastOptions={{classNames: {toast: 'chrome-glass border border-border text-foreground', description: 'text-muted-foreground', closeButton: 'border-[1.5px] border-[var(--border-strong)]'}}}
			{...props}
		/>
	)
}
