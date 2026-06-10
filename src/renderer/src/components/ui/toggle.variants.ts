import {cva} from 'class-variance-authority'

export const toggleVariants = cva(
	"group/toggle inline-flex items-center justify-center gap-1 rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)] aria-pressed:shadow-[inset_0_0_0_1px_var(--brand-dim)] data-[state=on]:border-[var(--brand)] data-[state=on]:bg-[var(--brand-dim)] data-[state=on]:text-[var(--brand)] data-[state=on]:shadow-[inset_0_0_0_1px_var(--brand-dim)] dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {default: 'bg-transparent', outline: 'border-[var(--field-border)] bg-[var(--field-bg)] shadow-[inset_0_1px_0_var(--field-highlight)] hover:border-[var(--brand)] hover:bg-[var(--brand-dim)]'},
			size: {
				default: 'h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2',
				sm: "h-7 min-w-7 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3.5",
				lg: 'h-9 min-w-9 px-2.5 has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2'
			}
		},
		defaultVariants: {variant: 'default', size: 'default'}
	}
)
