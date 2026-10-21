// core `lib: ES2022` bilan (DOM/Node tiplarisiz) quriladi — taymer va AbortSignal uchun minimal tiplar.

/** @internal */
export type TimerId = unknown;

interface TimerApi {
  setTimeout(callback: () => void, ms: number): TimerId;
  clearTimeout(id: TimerId): void;
}

/** @internal Global taymerlar (brauzer, Node, SSR — hammasida bor). */
export const timers: TimerApi = {
  setTimeout: (callback, ms) => (globalThis as unknown as TimerApi).setTimeout(callback, ms),
  clearTimeout: (id) => (globalThis as unknown as TimerApi).clearTimeout(id),
};

/** `AbortSignal` ning bizga kerakli qismi (haqiqiy `AbortSignal` mos keladi). */
export interface AbortSignalLike {
  readonly aborted: boolean;
  readonly reason?: unknown;
  addEventListener(type: 'abort', listener: () => void, options?: { once?: boolean }): void;
  removeEventListener(type: 'abort', listener: () => void): void;
}

/** @internal `DOMException('AbortError')`, bo'lmasa oddiy `Error`. */
export function createAbortError(message: string): Error {
  const Ctor = (globalThis as { DOMException?: new (message: string, name: string) => Error })
    .DOMException;
  if (Ctor) return new Ctor(message, 'AbortError');
  const error = new Error(message);
  error.name = 'AbortError';
  return error;
}
