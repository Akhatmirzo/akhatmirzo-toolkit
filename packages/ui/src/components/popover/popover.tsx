import * as PopoverPrimitive from '@radix-ui/react-popover';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';
import { useFloatingLayer } from '../../lib/modal-layer';
import { floatingContentPanel } from '../../lib/overlay-styles';

export type PopoverProps = ComponentProps<typeof PopoverPrimitive.Root>;

function PopoverRoot(props: PopoverProps) {
  return <PopoverPrimitive.Root {...props} />;
}

export type PopoverTriggerProps = ComponentProps<typeof PopoverPrimitive.Trigger>;

export function PopoverTrigger(props: PopoverTriggerProps) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

export type PopoverAnchorProps = ComponentProps<typeof PopoverPrimitive.Anchor>;

/** Panelni trigger o'rniga boshqa elementga nisbatan joylashtirish */
export function PopoverAnchor(props: PopoverAnchorProps) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export type PopoverCloseProps = ComponentProps<typeof PopoverPrimitive.Close>;

export function PopoverClose(props: PopoverCloseProps) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

export interface PopoverContentProps extends ComponentProps<typeof PopoverPrimitive.Content> {
  /** Trigger tomonga qaragan strelka */
  arrow?: boolean;
  /** Portal konteyneri (default — `document.body`) */
  container?: HTMLElement | null;
}

export function PopoverContent({
  side = 'bottom',
  align = 'center',
  sideOffset = 6,
  collisionPadding = 8,
  arrow = false,
  container,
  className,
  children,
  ...props
}: PopoverContentProps) {
  const layer = useFloatingLayer();
  return (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          floatingContentPanel,
          layer,
          'w-72 max-w-[calc(100vw-16px)] text-sm',
          'max-h-(--radix-popover-content-available-height)',
          // Strelka scroll elementidan tashqarida bo'lishi kerak — aks holda kesiladi
          arrow ? 'overflow-visible' : 'overflow-y-auto',
          className,
        )}
        {...props}
      >
        {arrow ? (
          <div
            data-slot="popover-scroll"
            className="max-h-[calc(var(--radix-popover-content-available-height)-2rem)] overflow-y-auto"
          >
            {children}
          </div>
        ) : (
          children
        )}
        {arrow && (
          <PopoverPrimitive.Arrow
            data-slot="popover-arrow"
            width={12}
            height={6}
            className="fill-surface-raised"
          />
        )}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

/**
 * Ichida interaktiv kontent bo'ladigan suzuvchi panel (forma, filtr).
 * Bosish bilan ochiladi; ochilganda fokus ichidagi birinchi elementga o'tadi.
 */
export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Close: PopoverClose,
  Anchor: PopoverAnchor,
});
