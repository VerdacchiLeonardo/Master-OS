import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold))]',
        secondary: 'border-border bg-secondary text-secondary-foreground',
        destructive: 'border-red-500/40 bg-red-500/10 text-red-400',
        outline: 'text-foreground border-border',
        crimson: 'border-[hsl(var(--crimson)/0.4)] bg-[hsl(var(--crimson)/0.1)] text-[hsl(var(--crimson))]',
        arcane: 'border-[hsl(var(--arcane)/0.4)] bg-[hsl(var(--arcane)/0.1)] text-purple-300',
        emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
        ghost: 'border-transparent bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
