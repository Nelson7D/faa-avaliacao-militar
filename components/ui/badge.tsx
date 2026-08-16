import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none border tracking-wide uppercase',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white border-primary/30 shadow-xs',
        secondary:
          'bg-slate-100 text-slate-700 border-slate-200/80',
        gold:
          'bg-amber-50 text-amber-900 border-amber-200/90 font-medium',
        sigFav:
          'bg-emerald-50 text-emerald-800 border-emerald-200/90 font-medium',
        fav:
          'bg-amber-50 text-amber-800 border-amber-200/90 font-medium',
        desfav:
          'bg-rose-50 text-rose-800 border-rose-200/90 font-medium',
        destructive:
          'bg-rose-600 text-white border-rose-700/30 shadow-xs',
        outline:
          'text-slate-700 border-slate-200 bg-white shadow-2xs',
        alert:
          'bg-rose-50 text-rose-700 border-rose-300 font-bold animate-alert-pulse',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
