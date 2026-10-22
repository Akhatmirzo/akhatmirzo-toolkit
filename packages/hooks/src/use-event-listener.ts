import { useEffect, type RefObject } from 'react';
import { resolveTarget } from './dom-target';
import { useLatestRef } from './internal';

export interface UseEventListenerOptions extends AddEventListenerOptions {
  /** `false` bo'lsa tinglanmaydi. Standart: `true`. */
  enabled?: boolean;
}

/** `useEventListener` nishoni: ref, element yoki `null` (tinglanmaydi). */
export type EventListenerTarget<T extends EventTarget = EventTarget> =
  T | RefObject<T | null> | null | undefined;

/**
 * Tiplangan hodisa tinglovchisi. `handler` har renderda yangilanadi, lekin qayta obuna
 * bo'linmaydi. `target` — `window` (standart), `document`, element yoki ref; `null` yoki
 * bo'sh ref — tinglanmaydi. Qisqa shakl `useEventListener('resize', fn)` — `window` uchun,
 * render paytida `window` ga murojaat qilmagani uchun SSR-xavfsiz.
 * @example
 * useEventListener('resize', () => setWidth(window.innerWidth));
 * useEventListener(buttonRef, 'pointerenter', () => prefetch());
 * useEventListener(document, 'visibilitychange', onVisibility, { enabled: open });
 */
export function useEventListener<K extends keyof WindowEventMap>(
  type: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: UseEventListenerOptions,
): void;
export function useEventListener<K extends keyof WindowEventMap>(
  target: Window | null | undefined,
  type: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: UseEventListenerOptions,
): void;
export function useEventListener<K extends keyof DocumentEventMap>(
  target: Document | null,
  type: K,
  handler: (event: DocumentEventMap[K]) => void,
  options?: UseEventListenerOptions,
): void;
export function useEventListener<
  K extends keyof HTMLElementEventMap,
  T extends HTMLElement = HTMLElement,
>(
  target: EventListenerTarget<T>,
  type: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: UseEventListenerOptions,
): void;
export function useEventListener(
  target: EventListenerTarget,
  type: string,
  handler: (event: Event) => void,
  options?: UseEventListenerOptions,
): void;
export function useEventListener(
  ...args:
    | [string, (event: Event) => void, UseEventListenerOptions?]
    | [EventListenerTarget, string, (event: Event) => void, UseEventListenerOptions?]
): void {
  const shorthand = typeof args[0] === 'string';
  const target = (shorthand ? undefined : args[0]) as EventListenerTarget;
  const type = (shorthand ? args[0] : args[1]) as string;
  const handler = (shorthand ? args[1] : args[2]) as (event: Event) => void;
  const options = (shorthand ? args[2] : args[3]) as UseEventListenerOptions | undefined;

  const handlerRef = useLatestRef(handler);
  const { enabled = true, capture, passive, once } = options ?? {};

  useEffect(() => {
    if (!enabled) return;
    // `undefined` — standart `window`; `null` — ataylab o'chirilgan
    const el =
      target === undefined
        ? typeof window === 'undefined'
          ? null
          : window
        : resolveTarget<EventTarget>(target);
    if (!el || typeof el.addEventListener !== 'function') return;
    const listener = (event: Event) => handlerRef.current(event);
    const opts: AddEventListenerOptions = { capture, passive, once };
    el.addEventListener(type, listener, opts);
    return () => el.removeEventListener(type, listener, opts);
  }, [target, type, enabled, capture, passive, once, handlerRef]);
}
