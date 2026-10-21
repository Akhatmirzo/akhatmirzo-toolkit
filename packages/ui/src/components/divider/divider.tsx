import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps extends ComponentProps<'div'> {
  orientation?: DividerOrientation;
  /** O'rtadagi matn ("yoki") */
  label?: ReactNode;
  /** Faqat bezak — ekran o'quvchidan yashiriladi (role="none") */
  decorative?: boolean;
}

export function Divider({
  orientation = 'horizontal',
  label,
  decorative = false,
  className,
  ...props
}: DividerProps) {
  const vertical = orientation === 'vertical';
  const a11y = decorative
    ? { role: 'none' }
    : {
        role: 'separator',
        'aria-orientation': orientation,
        'aria-label': typeof label === 'string' ? label : undefined,
      };

  if (label) {
    return (
      <div
        {...a11y}
        data-orientation={orientation}
        className={cn(
          'flex shrink-0 items-center gap-3 font-sans text-xs font-medium text-text-muted',
          'before:flex-1 before:bg-border after:flex-1 after:bg-border',
          vertical
            ? 'h-full min-h-16 flex-col self-stretch before:w-px after:w-px'
            : 'w-full before:h-px after:h-px',
          className,
        )}
        {...props}
      >
        <span className="shrink-0">{label}</span>
      </div>
    );
  }

  return (
    <div
      {...a11y}
      data-orientation={orientation}
      className={cn(
        'shrink-0 border-0 bg-border',
        vertical ? 'w-px self-stretch' : 'h-px w-full',
        className,
      )}
      {...props}
    />
  );
}
