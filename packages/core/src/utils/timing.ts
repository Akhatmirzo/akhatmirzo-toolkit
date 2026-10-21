import { timers, type TimerId } from './env';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyArgs = any[];

export interface Debounced<A extends AnyArgs> {
  (...args: A): void;
  /** Kutilayotgan chaqiruvni bekor qiladi */
  cancel(): void;
  /** Kutilayotgan chaqiruvni darhol bajaradi */
  flush(): void;
  /** Kutilayotgan chaqiruv bormi */
  pending(): boolean;
}

/**
 * Oxirgi chaqiruvdan `ms` o'tgach `fn` ni oxirgi argumentlar bilan bir marta chaqiradi.
 * @example
 * const save = debounce((q: string) => search(q), 300);
 * save('a'); save('ab'); // 300ms dan so'ng faqat search('ab')
 */
export function debounce<A extends AnyArgs>(fn: (...args: A) => unknown, ms: number): Debounced<A> {
  let timer: TimerId | undefined;
  let lastArgs: A | undefined;

  const run = () => {
    const args = lastArgs;
    timer = undefined;
    lastArgs = undefined;
    if (args) fn(...args);
  };

  const debounced = ((...args: A) => {
    lastArgs = args;
    if (timer !== undefined) timers.clearTimeout(timer);
    timer = timers.setTimeout(run, ms);
  }) as Debounced<A>;

  debounced.cancel = () => {
    if (timer !== undefined) timers.clearTimeout(timer);
    timer = undefined;
    lastArgs = undefined;
  };
  debounced.flush = () => {
    if (timer === undefined) return;
    timers.clearTimeout(timer);
    run();
  };
  debounced.pending = () => timer !== undefined;
  return debounced;
}

export interface Throttled<A extends AnyArgs> {
  (...args: A): void;
  /** Kutilayotgan (trailing) chaqiruvni bekor qiladi va hisobni yangilaydi */
  cancel(): void;
}

/**
 * `fn` ni ko'pi bilan `ms` da bir marta chaqiradi: birinchi chaqiruv darhol (leading),
 * oraliqda kelganlarning oxirgisi — oraliq tugaganda (trailing).
 * @example window.addEventListener('scroll', throttle(onScroll, 100));
 */
export function throttle<A extends AnyArgs>(fn: (...args: A) => unknown, ms: number): Throttled<A> {
  let last = -Infinity;
  let timer: TimerId | undefined;
  let lastArgs: A | undefined;

  const invoke = (args: A) => {
    last = Date.now();
    fn(...args);
  };

  const trailing = () => {
    timer = undefined;
    const args = lastArgs;
    lastArgs = undefined;
    if (args) invoke(args);
  };

  const throttled = ((...args: A) => {
    const remaining = ms - (Date.now() - last);
    if (remaining <= 0 || remaining > ms) {
      if (timer !== undefined) timers.clearTimeout(timer);
      timer = undefined;
      lastArgs = undefined;
      invoke(args);
      return;
    }
    lastArgs = args;
    timer ??= timers.setTimeout(trailing, remaining);
  }) as Throttled<A>;

  throttled.cancel = () => {
    if (timer !== undefined) timers.clearTimeout(timer);
    timer = undefined;
    lastArgs = undefined;
    last = -Infinity;
  };
  return throttled;
}
