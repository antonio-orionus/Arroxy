import * as React from 'react'
import { cn } from '@renderer/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('relative h-[3px] w-full overflow-hidden rounded-full bg-zinc-800', className)}
      {...props}
    >
      <div
        className="h-full rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
)
Progress.displayName = 'Progress'

export { Progress }
