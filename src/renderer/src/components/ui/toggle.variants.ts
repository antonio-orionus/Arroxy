import {cva} from 'class-variance-authority'

// Layout contract for every segmented control in the app:
//   * `min-w-0` + `wrap-anywhere` so a long localized label wraps inside its
//     own track instead of painting over the neighbouring segment.
//     `break-words` is NOT enough — `overflow-wrap: break-word` does not shrink
//     a flex/grid item's intrinsic min-content width, so a single long word
//     still overflows. `wrap-anywhere` (`overflow-wrap: anywhere`) does.
//   * `min-h-*` rather than `h-*`, so a wrapped label grows the control.
//   * no `min-w-*` floor and no `shrink-0`, so a narrow track can squeeze it.
// Use `shape="chip"` for short tokens (bitrates, extensions, file formats) that
// must never break across lines. Do not restate any of this at a call site: the
// raw CSS cascade emits `.whitespace-nowrap` after `.whitespace-normal` and
// `.shrink-0` after `.flex-1`, so an override only ever works by grace of
// tailwind-merge stripping the base class.
export const toggleVariants = cva(
	"group/toggle inline-flex min-w-0 items-center justify-center gap-1 rounded-lg border border-transparent bg-clip-padding text-sm font-medium wrap-anywhere transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)] aria-pressed:shadow-[inset_0_0_0_1px_var(--brand-dim)] data-[state=on]:border-[var(--brand)] data-[state=on]:bg-[var(--brand-dim)] data-[state=on]:text-[var(--brand)] data-[state=on]:shadow-[inset_0_0_0_1px_var(--brand-dim)] dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {default: 'bg-transparent', outline: 'border-[var(--field-border)] bg-[var(--field-bg)] shadow-[inset_0_1px_0_var(--field-highlight)] hover:border-[var(--brand)] hover:bg-[var(--brand-dim)]'},
			size: {
				default: 'min-h-8 px-2.5 has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2',
				sm: "min-h-7 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3.5",
				lg: 'min-h-9 px-2.5 has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2'
			},
			shape: {label: '', chip: 'shrink-0 whitespace-nowrap'}
		},
		defaultVariants: {variant: 'default', size: 'default', shape: 'label'}
	}
)
