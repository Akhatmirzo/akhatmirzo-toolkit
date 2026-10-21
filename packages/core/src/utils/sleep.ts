import { createAbortError, timers, type AbortSignalLike } from './env';

function abortReason(signal: AbortSignalLike): unknown {
  return signal.reason ?? createAbortError('Bekor qilindi');
}

/**
 * `ms` millisekund kutadi. `signal` bekor qilinsa — `signal.reason` (yoki `AbortError`) bilan reject.
 * @example
 * const ctrl = new AbortController();
 * await sleep(1000, ctrl.signal);
 */
export function sleep(ms: number, signal?: AbortSignalLike): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortReason(signal));
      return;
    }
    const onAbort = () => {
      timers.clearTimeout(timer);
      reject(abortReason(signal!));
    };
    const timer = timers.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
