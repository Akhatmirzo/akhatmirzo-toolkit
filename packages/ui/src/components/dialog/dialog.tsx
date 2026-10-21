import { useMediaQuery } from '@akhatmirzo/hooks';
import * as RadixDialog from '@radix-ui/react-dialog';
import { useRef, type ComponentProps } from 'react';
import { cn } from '../../lib/cn';
import { mergeRefs } from '../../lib/refs';
import { ModalLayerContext } from '../../lib/modal-layer';
import { MOBILE_QUERY } from '../../lib/media';
import {
  focusInitial,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  useReturnFocus,
  modalFooter,
  type ModalContentBaseProps,
} from './modal-parts';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type DialogProps = ComponentProps<typeof RadixDialog.Root>;

/** Dialog ildizi: `open` / `defaultOpen` / `onOpenChange` */
function DialogRoot(props: DialogProps) {
  return <RadixDialog.Root {...props} />;
}

export type DialogTriggerProps = ComponentProps<typeof RadixDialog.Trigger>;

export function DialogTrigger(props: DialogTriggerProps) {
  return <RadixDialog.Trigger {...props} />;
}

export type DialogCloseProps = ComponentProps<typeof RadixDialog.Close>;

export function DialogClose(props: DialogCloseProps) {
  return <RadixDialog.Close {...props} />;
}

export interface DialogContentProps extends ModalContentBaseProps {
  /** 400 / 520 / 640 / 800px / butun ekran */
  size?: DialogSize;
  /** Telefonda (< 640px) pastdan chiqadigan sheet */
  mobileSheet?: boolean;
}

const sizes: Record<DialogSize, string> = {
  sm: 'max-w-100',
  md: 'max-w-130',
  lg: 'max-w-160',
  xl: 'max-w-200',
  full: 'max-w-none h-[calc(100dvh-32px)]',
};

const motionReduce =
  'motion-reduce:data-[state=open]:animate-overlay-in motion-reduce:data-[state=closed]:animate-overlay-out';

export function DialogContent({
  title,
  hideTitle = false,
  description,
  size = 'md',
  closeButton = true,
  dismissible = true,
  mobileSheet = true,
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
}: DialogContentProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const returnFocus = useReturnFocus();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const sheet = mobileSheet && isMobile;
  const hasDescription = description != null && description !== false;

  return (
    <RadixDialog.Portal container={container}>
      <ModalOverlay className={overlayClassName} />
      <RadixDialog.Content
        ref={mergeRefs(ref, innerRef)}
        data-size={size}
        data-sheet={sheet ? '' : undefined}
        // Izoh bo'lmasa — Radix ogohlantirishini o'chiradi
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
          'fixed z-(--ak-z-modal) flex max-h-[calc(100dvh-32px)] flex-col overflow-y-auto overscroll-contain',
          'border-0 bg-surface p-6 font-sans text-text shadow-xl outline-none',
          sheet
            ? [
                'inset-x-0 bottom-0 w-full rounded-t-2xl pb-[max(24px,env(safe-area-inset-bottom))]',
                'data-[state=open]:animate-slide-in-bottom data-[state=closed]:animate-slide-out-bottom',
                size === 'full' && 'h-[calc(100dvh-32px)]',
              ]
            : [
                'top-1/2 left-1/2 w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl',
                'data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out',
                sizes[size],
              ],
          motionReduce,
          className,
        )}
        {...props}
      >
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

export type DialogFooterProps = ComponentProps<'div'>;

/** Pastki tugmalar: o'ngga tekislangan, 8px oraliq */
export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return <div className={cn(modalFooter, className)} {...props} />;
}

export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Footer: DialogFooter,
  Close: DialogClose,
});
