import { cva, type VariantProps } from 'class-variance-authority';
import { useSyncExternalStore, type ComponentProps } from 'react';
import { cn } from '../../lib/cn';

export const kbdVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-1 rounded-sm border border-b-2 border-border bg-surface-muted font-mono font-medium whitespace-nowrap text-text-muted',
  {
    variants: {
      size: {
        sm: 'h-5 min-w-5 px-1.5 text-xs',
        md: 'h-6 min-w-6 px-2 text-sm',
      },
    },
    defaultVariants: { size: 'sm' },
  },
);

export interface KbdProps extends ComponentProps<'kbd'>, VariantProps<typeof kbdVariants> {
  /** Tugmalar ketma-ketligi; `mod` — macOS'da `⌘`, boshqalarida `Ctrl` */
  keys?: string[];
}

const subscribe = () => () => {};

/** Apple qurilmasimi (SSR'da — yo'q) */
export function isApplePlatform() {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent;
  return /mac|iphone|ipad|ipod/i.test(platform);
}

export function Kbd({ keys, size, className, children, ...props }: KbdProps) {
  const apple = useSyncExternalStore(subscribe, isApplePlatform, () => false);
  const s = size ?? 'sm';
  return (
    <kbd data-size={s} className={cn(kbdVariants({ size: s }), className)} {...props}>
      {keys
        ? keys.map((key, i) => (
            <span key={`${key}-${i}`}>
              {key.toLowerCase() === 'mod' ? (apple ? '⌘' : 'Ctrl') : key}
            </span>
          ))
        : children}
    </kbd>
  );
}
