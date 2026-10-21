import * as RadixDialog from '@radix-ui/react-dialog';
import { useRef, type ComponentProps } from 'react';
import { cn } from '../../lib/cn';
import { mergeRefs } from '../../lib/refs';
import { ModalLayerContext } from '../../lib/modal-layer';
import {
  focusInitial,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  useReturnFocus,
  type ModalContentBaseProps,
} from '../dialog/modal-parts';

export type DrawerSide = 'right' | 'left' | 'bottom' | 'top';
export type DrawerSize = 'sm' | 'md' | 'lg';

export type DrawerProps = ComponentProps<typeof RadixDialog.Root>;

/** Drawer ildizi: `open` / `defaultOpen` / `onOpenChange` */
function DrawerRoot(props: DrawerProps) {
  return <RadixDialog.Root {...props} />;
}

export type DrawerTriggerProps = ComponentProps<typeof RadixDialog.Trigger>;

export function DrawerTrigger(props: DrawerTriggerProps) {
  return <RadixDialog.Trigger {...props} />;
}

export type DrawerCloseProps = ComponentProps<typeof RadixDialog.Close>;

export function DrawerClose(props: DrawerCloseProps) {
  return <RadixDialog.Close {...props} />;
}

export interface DrawerContentProps extends ModalContentBaseProps {
  /** Qaysi chetdan chiqadi */
  side?: DrawerSide;
  /** 320 / 420 / 560px — chap/o'ngda kenglik, past/tepada balandlik */
  size?: DrawerSize;
}

const sides: Record<DrawerSide, string> = {
  right: [
    'inset-y-0 right-0 h-dvh',
    'data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right',
  ].join(' '),
  left: [
    'inset-y-0 left-0 h-dvh',
    'data-[state=open]:animate-slide-in-left data-[state=closed]:animate-slide-out-left',
  ].join(' '),
  bottom: [
    'inset-x-0 bottom-0 rounded-t-2xl pt-3 pb-[max(24px,env(safe-area-inset-bottom))]',
    'data-[state=open]:animate-slide-in-bottom data-[state=closed]:animate-slide-out-bottom',
  ].join(' '),
  top: [
    'inset-x-0 top-0 rounded-b-2xl',
    'data-[state=open]:animate-slide-in-top data-[state=closed]:animate-slide-out-top',
  ].join(' '),
};

const widths: Record<DrawerSize, string> = {
  sm: 'w-[min(320px,100vw)]',
  md: 'w-[min(420px,100vw)]',
  lg: 'w-[min(560px,100vw)]',
};

const heights: Record<DrawerSize, string> = {
  sm: 'h-[min(320px,calc(100dvh-32px))]',
  md: 'h-[min(420px,calc(100dvh-32px))]',
  lg: 'h-[min(560px,calc(100dvh-32px))]',
};

export function DrawerContent({
  side = 'right',
  size = 'md',
  title,
  hideTitle = false,
  description,
  closeButton = true,
  dismissible = true,
  overlayClassName,
  container,
  labels,
  className,
  children,
  ref,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onInteractOutside,
  ...props
}: DrawerContentProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const returnFocus = useReturnFocus();
  const vertical = side === 'bottom' || side === 'top';
  const hasDescription = description != null && description !== false;

  return (
    <RadixDialog.Portal container={container}>
      <ModalOverlay className={overlayClassName} />
      <RadixDialog.Content
        ref={mergeRefs(ref, innerRef)}
        data-side={side}
        data-size={size}
        {...(hasDescription ? {} : { 'aria-describedby': undefined })}
        onOpenAutoFocus={(event) => {
          returnFocus.save();
          onOpenAutoFocus?.(event);
          if (!event.defaultPrevented) focusInitial(event, innerRef.current);
        }}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event);
          returnFocus.restore(event);
        }}
        onInteractOutside={(event) => {
          onInteractOutside?.(event);
          if (!dismissible) event.preventDefault();
        }}
        className={cn(
          'fixed z-(--ak-z-modal) flex flex-col overflow-y-auto overscroll-contain',
          'border-0 bg-surface p-6 font-sans text-text shadow-xl outline-none',
          sides[side],
          vertical ? heights[size] : widths[size],
          'motion-reduce:data-[state=open]:animate-overlay-in motion-reduce:data-[state=closed]:animate-overlay-out',
          className,
        )}
        {...props}
      >
        {side === 'bottom' && (
          <div
            aria-hidden="true"
            data-drawer-handle=""
            className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-border-strong"
          />
        )}
        <ModalHeader
          title={title}
          hideTitle={hideTitle}
          description={description}
          closeButton={closeButton}
        />
        <ModalLayerContext.Provider value={true}>{children}</ModalLayerContext.Provider>
        {closeButton && <ModalCloseButton label={labels?.close ?? 'Yopish'} />}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export type DrawerFooterProps = ComponentProps<'div'>;

/** Pastki tugmalar — panel tubiga yopishadi */
export function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return (
    <div
      className={cn('mt-auto flex flex-wrap items-center justify-end gap-2 pt-6', className)}
      {...props}
    />
  );
}

export const Drawer = Object.assign(DrawerRoot, {
  Trigger: DrawerTrigger,
  Content: DrawerContent,
  Footer: DrawerFooter,
  Close: DrawerClose,
});
