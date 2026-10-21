import { useEffect, type RefObject } from 'react';
import { useLatestRef } from './internal';

/** Bitta ref yoki reflar massivi. */
export type ClickOutsideRefs = RefObject<Element | null> | ReadonlyArray<RefObject<Element | null>>;

/**
 * Berilgan element(lar)dan tashqarida `pointerdown` bo'lganda `handler` chaqiriladi.
 * @example useClickOutside([triggerRef, panelRef], () => setOpen(false), open);
 */
export function useClickOutside(
  refs: ClickOutsideRefs,
  handler: (event: PointerEvent) => void,
  enabled = true,
): void {
  const refsRef = useLatestRef(refs);
  const handlerRef = useLatestRef(handler);

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      // DOM'dan olib tashlangan element (masalan, bosilganda yopilgan menyu) hisobga olinmaydi
      if (!(target instanceof Node) || !target.isConnected) return;
      const current = refsRef.current;
      const list: ReadonlyArray<RefObject<Element | null>> = Array.isArray(current)
        ? current
        : [current as RefObject<Element | null>];
      if (!list.some((ref) => ref.current?.contains(target))) handlerRef.current(event);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [enabled, refsRef, handlerRef]);
}
