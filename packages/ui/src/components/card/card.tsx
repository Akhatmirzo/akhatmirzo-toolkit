import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/cn';

const cardVariants = cva('flex flex-col rounded-xl border font-sans text-text', {
  variants: {
    variant: {
      elevated: 'border-border bg-surface shadow-sm',
      outline: 'border-border bg-surface',
      soft: 'border-transparent bg-surface-muted',
    },
    padding: {
      none: 'gap-0 p-0',
      sm: 'gap-3 p-4',
      md: 'gap-4 p-6',
      lg: 'gap-6 p-8',
    },
    interactive: {
      true: 'focus-ring cursor-pointer transition-[box-shadow,border-color] duration-base ease-out',
      false: '',
    },
  },
  compoundVariants: [
    { interactive: true, variant: 'elevated', className: 'hover:shadow-md' },
    {
      interactive: true,
      variant: 'outline',
      className: 'hover:border-border-strong hover:shadow-md',
    },
    { interactive: true, variant: 'soft', className: 'hover:shadow-md' },
  ],
  defaultVariants: { variant: 'elevated', padding: 'md', interactive: false },
});

export interface CardProps extends ComponentProps<'div'>, VariantProps<typeof cardVariants> {
  /**
   * Hover/fokus ko'rinishini yoqadi. Faqat stil — klaviatura uchun `asChild` bilan
   * `<a>` yoki `<button>` bering; oddiy `<div onClick>` Tab bilan fokuslanmaydi.
   */
  interactive?: boolean | null;
  /** Bolasini render qiladi (masalan `<a>` — butun karta havola) */
  asChild?: boolean;
}

function CardRoot({
  variant,
  padding,
  interactive,
  asChild = false,
  className,
  ...props
}: CardProps) {
  const Comp = asChild ? Slot : 'div';
  const v = variant ?? 'elevated';
  const p = padding ?? 'md';
  return (
    <Comp
      data-variant={v}
      data-padding={p}
      data-interactive={interactive ? '' : undefined}
      className={cn(
        cardVariants({ variant: v, padding: p, interactive: !!interactive }),
        className,
      )}
      {...props}
    />
  );
}

export interface CardHeaderProps extends Omit<ComponentProps<'div'>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  /** O'ng tomondagi element (badge, tugma, menyu) */
  action?: ReactNode;
}

export function CardHeader({
  title,
  description,
  action,
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)} {...props}>
      {(title || description || children) && (
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {title && <h3 className="text-lg font-semibold text-text">{title}</h3>}
          {description && <p className="text-sm text-text-muted">{description}</p>}
          {children}
        </div>
      )}
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export type CardBodyProps = ComponentProps<'div'>;

export function CardBody({ className, ...props }: CardBodyProps) {
  return <div className={cn('text-sm text-text', className)} {...props} />;
}

export type CardFooterProps = ComponentProps<'div'>;

export function CardFooter({ className, ...props }: CardFooterProps) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)} {...props} />;
}

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});

export { cardVariants };
