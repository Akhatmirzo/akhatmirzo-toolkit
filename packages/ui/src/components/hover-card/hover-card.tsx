import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { cva } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';
import { useFloatingLayer } from '../../lib/modal-layer';
import { floatingContentPanel } from '../../lib/overlay-styles';

export type HoverCardSize = 'sm' | 'md';

const hoverCardContentVariants = cva(
  [
    floatingContentPanel,
    'max-w-[calc(100vw-16px)] text-sm',
    'max-h-(--radix-hover-card-content-available-height) overflow-y-auto',
  ],
  {
    variants: {
      size: {
        sm: 'w-60',
        md: 'w-80',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface HoverCardProps extends ComponentProps<typeof HoverCardPrimitive.Root> {
  /** Kursor kelgandan keyin ochilish kechikishi, ms */
  openDelay?: number;
  /** Kursor ketgandan keyin yopilish kechikishi, ms */
  closeDelay?: number;
}

function HoverCardRoot({ openDelay = 500, closeDelay = 200, ...props }: HoverCardProps) {
  return <HoverCardPrimitive.Root openDelay={openDelay} closeDelay={closeDelay} {...props} />;
}

export type HoverCardTriggerProps = ComponentProps<typeof HoverCardPrimitive.Trigger>;

/** Odatda `asChild` bilan havola yoki tugma o'raladi (default — `<a>`) */
export function HoverCardTrigger(props: HoverCardTriggerProps) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />;
}

export interface HoverCardContentProps extends ComponentProps<typeof HoverCardPrimitive.Content> {
  /** Panel kengligi: `sm` — 240px, `md` — 320px */
  size?: HoverCardSize;
  /** Portal konteyneri (default — `document.body`) */
  container?: HTMLElement | null;
}

export function HoverCardContent({
  side = 'bottom',
  align = 'center',
  sideOffset = 6,
  collisionPadding = 8,
  size = 'md',
  container,
  className,
  ...props
}: HoverCardContentProps) {
  const layer = useFloatingLayer();
  return (
    <HoverCardPrimitive.Portal container={container}>
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        data-size={size}
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(hoverCardContentVariants({ size }), layer, className)}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

/**
 * Havola ustiga kursor kelganda (yoki klaviatura fokusida) chiqadigan oldindan ko'rish kartasi:
 * profil, mahsulot, havola tafsiloti. Faqat qo'shimcha ma'lumot uchun — sensorli ekranda
 * ochilmaydi, shuning uchun muhim ma'lumot boshqa joyda ham bo'lsin.
 */
export const HoverCard = Object.assign(HoverCardRoot, {
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
});

export { hoverCardContentVariants };
