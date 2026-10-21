import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Children,
  cloneElement,
  isValidElement,
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from '../spinner';

export const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap select-none',
    'rounded-lg border border-transparent font-sans font-medium no-underline',
    'transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-base ease-out',
    'not-data-disabled:active:scale-[0.97] not-data-disabled:active:duration-fast',
    'focus-ring',
    'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    'data-loading:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground not-data-disabled:hover:bg-primary-hover',
        soft: 'bg-primary-soft text-primary-soft-foreground not-data-disabled:hover:bg-primary-soft-hover',
        outline: 'border-border bg-surface text-text not-data-disabled:hover:border-border-strong',
        ghost: 'bg-transparent text-text-subtle not-data-disabled:hover:bg-surface-muted',
        danger: 'bg-danger text-danger-foreground not-data-disabled:hover:bg-danger-hover',
        link: 'bg-transparent text-link underline-offset-4 not-data-disabled:hover:underline',
      },
      size: {
        // sm: ko'rinmas kengaytirilgan bosish maydoni (≥ 40px)
        sm: "h-8 px-3 text-sm before:absolute before:inset-x-0 before:top-1/2 before:h-10 before:-translate-y-1/2 before:content-['']",
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-5 text-base',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'link',
        className: 'h-auto rounded-sm border-0 px-0 not-data-disabled:active:scale-100',
      },
    ],
    defaultVariants: { variant: 'soft', size: 'md', fullWidth: false },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;
export type ButtonVariant = NonNullable<ButtonVariantProps['variant']>;
export type ButtonSize = NonNullable<ButtonVariantProps['size']>;

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Yuklanish: matn joyida qoladi, ustida spinner, bosish o'chadi */
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  /** O'z elementi o'rniga bolasini render qiladi (masalan `<a>`) */
  asChild?: boolean;
  /** Ichki matnlar (ekran o'quvchi uchun) */
  labels?: { loading?: string };
}

const iconSize: Record<ButtonSize, string> = {
  sm: '[&>svg]:size-4',
  md: '[&>svg]:size-[18px]',
  lg: '[&>svg]:size-5',
};

export function Button({
  variant = 'soft',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  asChild = false,
  labels,
  disabled = false,
  className,
  children,
  onClick,
  type,
  ...props
}: ButtonProps) {
  const hidden = loading && 'opacity-0';
  const icon = (node: ReactNode) =>
    node != null &&
    node !== false && (
      <span aria-hidden="true" className={cn('inline-flex shrink-0', iconSize[size], hidden)}>
        {node}
      </span>
    );
  const content = (inner: ReactNode) => (
    <>
      {icon(leftIcon)}
      {inner != null && inner !== false && <span className={cn(hidden)}>{inner}</span>}
      {icon(rightIcon)}
      {loading && (
        <Spinner
          aria-hidden="true"
          size={size === 'lg' ? 'md' : 'sm'}
          className="absolute inset-0 m-auto"
        />
      )}
      {/* Yuklanish boshlanganini e'lon qiladi (aria-busy ko'p o'quvchilarda o'qilmaydi) */}
      <span aria-live="polite" className="sr-only">
        {loading ? ` ${labels?.loading ?? 'Yuklanmoqda'}` : null}
      </span>
    </>
  );

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const shared = {
    'data-variant': variant,
    'data-size': size,
    'data-disabled': disabled ? '' : undefined,
    'data-loading': loading ? '' : undefined,
    'aria-busy': loading || undefined,
    className: cn(buttonVariants({ variant, size, fullWidth }), className),
    onClick: handleClick,
  };

  if (asChild) {
    const child = Children.only(children) as ReactElement<{ children?: ReactNode }>;
    if (!isValidElement(child)) return null;
    return (
      <Slot
        {...props}
        {...shared}
        aria-disabled={disabled || loading || undefined}
        tabIndex={disabled ? -1 : props.tabIndex}
      >
        {cloneElement(child, undefined, content(child.props.children))}
      </Slot>
    );
  }

  return (
    <button
      type={type ?? 'button'}
      disabled={disabled}
      aria-disabled={loading || undefined}
      {...props}
      {...shared}
    >
      {content(children)}
    </button>
  );
}
