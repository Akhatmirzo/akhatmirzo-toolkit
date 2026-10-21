import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';

export type SkeletonVariant = 'rect' | 'circle';

export interface SkeletonProps extends ComponentProps<'div'> {
  /** `circle` — avatar o'rni uchun */
  variant?: SkeletonVariant;
}

function SkeletonRoot({ variant = 'rect', className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      data-variant={variant}
      className={cn(
        'relative block shrink-0 overflow-hidden bg-surface-muted',
        variant === 'circle' ? 'rounded-full' : 'rounded-md',
        'before:absolute before:inset-0 before:bg-linear-to-r before:from-transparent before:via-surface/60 before:to-transparent dark:before:via-border-strong/60',
        'before:animate-shimmer',
        'motion-reduce:animate-pulse motion-reduce:before:hidden',
        className,
      )}
      {...props}
    />
  );
}

export interface SkeletonTextProps extends ComponentProps<'div'> {
  /** Qatorlar soni; oxirgisi 60% kenglikda */
  lines?: number;
}

export function SkeletonText({ lines = 3, className, ...props }: SkeletonTextProps) {
  const count = Math.max(1, Math.floor(lines));
  return (
    <div aria-hidden="true" className={cn('flex w-full flex-col gap-2', className)} {...props}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonRoot
          key={i}
          className={cn('h-4 rounded-sm', count > 1 && i === count - 1 ? 'w-3/5' : 'w-full')}
        />
      ))}
    </div>
  );
}

export const Skeleton = Object.assign(SkeletonRoot, { Text: SkeletonText });
