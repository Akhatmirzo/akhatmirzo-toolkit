import { useEffect } from 'react';
import { resolveTarget, type TargetLike } from './dom-target';
import { useLatestRef } from './internal';

export interface UseFocusTrapOptions {
  /** Faollashganda fokuslanadigan element. Standart: konteynerdagi birinchi fokuslanuvchi. */
  initialFocus?: TargetLike<HTMLElement>;
  /** O'chirilganda fokusni avvalgi elementga qaytarish. Standart: `true`. */
  returnFocus?: boolean;
}

const TABBABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'audio[controls]',
  'video[controls]',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

/** Konteyner ichidagi Tab bilan fokuslanadigan elementlar (DOM tartibida). */
function getTabbables(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (el) => el.tabIndex >= 0 && !el.closest('[hidden], [inert]'),
  );
}

// Ichma-ich tuzoqlar: faqat eng oxirgi faollashgani ishlaydi
const stack: HTMLElement[] = [];

/**
 * Fokusni konteyner ichida ushlab turadi: `Tab` / `Shift+Tab` chetlarda aylanadi, tashqariga
 * chiqqan fokus qaytariladi. O'chirilganda (yoki unmount'da) fokus avvalgi elementga qaytadi.
 * Ichma-ich tuzoqlarda faqat oxirgisi faol.
 * @example
 * const panelRef = useRef<HTMLDivElement>(null);
 * useFocusTrap(panelRef, open, { initialFocus: inputRef });
 */
export function useFocusTrap(
  target: TargetLike<HTMLElement>,
  active: boolean,
  options: UseFocusTrapOptions = {},
): void {
  const optionsRef = useLatestRef(options);

  useEffect(() => {
    if (!active || typeof document === 'undefined') return;
    const container = resolveTarget(target);
    if (!container) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    stack.push(container);
    const isTop = () => stack[stack.length - 1] === container;

    // Fokuslanuvchi element bo'lmasa — konteynerning o'zi
    let addedTabIndex = false;
    const focusContainer = () => {
      if (!container.hasAttribute('tabindex')) {
        container.setAttribute('tabindex', '-1');
        addedTabIndex = true;
      }
      container.focus();
    };
    const focusFirst = () => {
      const first = getTabbables(container)[0];
      if (first) first.focus();
      else focusContainer();
    };

    const initial = resolveTarget(optionsRef.current.initialFocus);
    if (initial) initial.focus();
    else if (!container.contains(document.activeElement)) focusFirst();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || event.defaultPrevented || !isTop()) return;
      const items = getTabbables(container);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) {
        event.preventDefault();
        focusContainer();
        return;
      }
      const current = document.activeElement;
      const inside = current instanceof Node && container.contains(current);
      if (event.shiftKey && (!inside || current === first || current === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (!inside || current === last)) {
        event.preventDefault();
        first.focus();
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      if (!isTop()) return;
      const next = event.target;
      if (next instanceof Node && !container.contains(next)) focusFirst();
    };

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('focusin', onFocusIn);
      const index = stack.lastIndexOf(container);
      if (index !== -1) stack.splice(index, 1);
      if (addedTabIndex) container.removeAttribute('tabindex');
      // Ataylab yopilish paytidagi eng so'nggi `returnFocus` o'qiladi
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if ((optionsRef.current.returnFocus ?? true) && previous?.isConnected) previous.focus();
    };
  }, [target, active, optionsRef]);
}
