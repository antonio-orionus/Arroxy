import * as React from 'react'
import { cn } from '@renderer/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 transition-[border-color,box-shadow] outline-none',
        'placeholder:text-zinc-500',
        'focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-dim)]',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
