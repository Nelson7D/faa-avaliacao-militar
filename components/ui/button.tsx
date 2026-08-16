import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium text-xs transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white shadow-xs hover:bg-primary-light active:bg-primary-dark border border-primary/20',
        gold:
          'bg-[#B89047] text-white shadow-xs hover:bg-[#A37E39] active:bg-[#8B6A2E] font-medium border border-[#D4AF37]/30',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-rose-700 active:bg-rose-800 border border-rose-600/30',
        outline:
          'border border-slate-200 bg-white text-slate-800 shadow-2xs hover:bg-slate-50 hover:text-primary hover:border-slate-300 active:bg-slate-100',
        secondary:
          'bg-slate-100 text-slate-800 hover:bg-slate-200/80 active:bg-slate-200 border border-slate-200/60',
        ghost:
          'text-slate-700 hover:bg-slate-100/80 hover:text-primary active:bg-slate-100',
        link:
          'text-primary underline-offset-4 hover:underline p-0 h-auto font-medium',
        tactical:
          'bg-[#0B1612] text-slate-100 border border-sidebar-border hover:bg-sidebar-surface active:bg-[#0B1612]',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-[11px]',
        lg: 'h-10 rounded-xl px-6 text-sm',
        icon: 'h-9 w-9 rounded-lg',
        iconSm: 'h-7 w-7 rounded-md p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
