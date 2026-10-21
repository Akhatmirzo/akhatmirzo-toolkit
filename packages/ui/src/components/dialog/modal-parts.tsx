/*
 * Dialog va Drawer uchun umumiy ichki qismlar (tashqariga eksport qilinmaydi).
 */
import * as RadixDialog from '@radix-ui/react-dialog';
import { useRef, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { overlayBackdrop } from '../../lib/overlay-styles';
import { IconButton } from '../icon-button';

/** Standart matnlar */
export interface ModalLabels {
  /** ✕ tugmasi nomi — default "Yopish" */
  close?: string;
}

/** Kontent prop'lari: Dialog.Content va Drawer.Content uchun umumiy */
export interface ModalContentBaseProps extends Omit<
  ComponentProps<typeof RadixDialog.Content>,
  'title'
> {
  /** Sarlavha — majburiy (ekran o'quvchi uchun ham) */
  title: ReactNode;
  /** Sarlavhani ko'rinmas qiladi, lekin ekran o'quvchi o'qiydi */
  hideTitle?: boolean;
  description?: ReactNode;
  /** O'ng yuqorida ✕ tugmasi */
  closeButton?: boolean;
  /** `false` — tashqariga bosish yopmaydi (Esc ishlaydi) */
  dismissible?: boolean;
  /** Fon (overlay) uchun qo'shimcha klass */
  overlayClassName?: string;
  /** Portal konteyneri (default — `document.body`) */
  container?: HTMLElement | null;
  labels?: ModalLabels;
}

const FIELD_SELECTOR = [
  'input:not([type="hidden"]):not(:disabled)',
  'textarea:not(:disabled)',
  'select:not(:disabled)',
  '[contenteditable="true"]',
].join(', ');

const TABBABLE_SELECTOR = [
  'button:not(:disabled)',
  'a[href]',
  FIELD_SELECTOR,
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Dastlabki fokus: `[data-autofocus]` → birinchi maydon → birinchi tugma (✕ dan tashqari) →
 * panelning o'zi. Radix standarti ✕ ga fokus berib yuborardi.
 */
export function focusInitial(event: Event, root: HTMLElement | null) {
  if (!root) return;
  event.preventDefault();
  const target =
    root.querySelector<HTMLElement>('[data-autofocus]') ??
    root.querySelector<HTMLElement>(FIELD_SELECTOR) ??
    Array.from(root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).find(
      (el) => !el.hasAttribute('data-modal-close'),
    ) ??
    root;
  target.focus();
}

/**
 * Fokusni qaytarish zaxirasi: Radix fokusni faqat `Trigger` ga qaytaradi. Trigger bo'lmasa
 * (boshqariladigan rejim, `confirm()`) — ochilishdan oldin fokusda bo'lgan elementga qaytaramiz.
 */
export function useReturnFocus() {
  const saved = useRef<HTMLElement | null>(null);
  return {
    save() {
      const el = document.activeElement;
      saved.current = el instanceof HTMLElement && el !== document.body ? el : null;
    },
    restore(event: Event) {
      if (event.defaultPrevented) return;
      const el = saved.current;
      if (!el) return;
      // Radix trigger'ga fokus berib bo'lgach tekshiriladi
      setTimeout(() => {
        const active = document.activeElement;
        if (el.isConnected && (!active || active === document.body)) el.focus();
      }, 0);
    },
  };
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function ModalOverlay({ className }: { className?: string }) {
  return <RadixDialog.Overlay data-overlay="" className={cn(overlayBackdrop, className)} />;
}

/** Sarlavha + izoh. Ko'rinadigan matn bo'lsa, pastdan 20px oraliq */
export function ModalHeader({
  title,
  hideTitle,
  description,
  closeButton,
}: Pick<ModalContentBaseProps, 'title' | 'hideTitle' | 'description' | 'closeButton'>) {
  const hasDescription = description != null && description !== false;
  return (
    <div className={cn('flex flex-col gap-1', (!hideTitle || hasDescription) && 'mb-5')}>
      <RadixDialog.Title
        className={cn(
          'm-0 font-sans text-xl font-semibold tracking-tight text-text',
          closeButton && 'pr-8',
          hideTitle && 'sr-only',
        )}
      >
        {title}
      </RadixDialog.Title>
      {hasDescription && (
        <RadixDialog.Description
          className={cn('m-0 text-sm text-text-muted', closeButton && hideTitle && 'pr-8')}
        >
          {description}
        </RadixDialog.Description>
      )}
    </div>
  );
}

export function ModalCloseButton({ label }: { label: string }) {
  return (
    <RadixDialog.Close asChild>
      <IconButton
        data-modal-close=""
        variant="ghost"
        size="sm"
        aria-label={label}
        className="absolute top-4 right-4"
      >
        <CloseIcon />
      </IconButton>
    </RadixDialog.Close>
  );
}

/** Pastki tugmalar qatori */
export const modalFooter = 'mt-6 flex flex-wrap items-center justify-end gap-2';
