import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';
import { useLatestRef } from './internal';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseAsyncOptions {
  /** Mount'da va `deps` o'zgarganda avtomatik ishga tushirish. Standart: `true`. */
  immediate?: boolean;
}

export interface UseAsyncResult<T, Args extends unknown[]> {
  status: AsyncStatus;
  /** Oxirgi muvaffaqiyatli natija (yangi yuklanish va xatoda saqlanib qoladi). */
  data: T | undefined;
  error: unknown;
  /** Qo'lda ishga tushirish. Eskirgan yoki xato chaqiruvda `undefined` qaytaradi. */
  run: (...args: Args) => Promise<T | undefined>;
}

interface AsyncState<T> {
  status: AsyncStatus;
  data: T | undefined;
  error: unknown;
}

/**
 * Asinxron funksiya holati. Faqat eng so'nggi chaqiruv natijasi qabul qilinadi (race'dan himoya),
 * unmount'dan keyingi javoblar e'tiborsiz qoldiriladi. Har doim eng so'nggi `fn` ishlatiladi.
 * @example const { status, data, error, run } = useAsync(() => fetchUsers(page), [page]);
 */
export function useAsync<T, Args extends unknown[] = []>(
  fn: (...args: Args) => Promise<T>,
  deps: DependencyList = [],
  { immediate = true }: UseAsyncOptions = {},
): UseAsyncResult<T, Args> {
  const [state, setState] = useState<AsyncState<T>>(() => ({
    status: immediate ? 'loading' : 'idle',
    data: undefined,
    error: undefined,
  }));
  const fnRef = useLatestRef(fn);
  const callId = useRef(0);

  const run = useCallback(
    async (...args: Args) => {
      const id = ++callId.current;
      setState((s) =>
        s.status === 'loading' && s.error === undefined
          ? s
          : { status: 'loading', data: s.data, error: undefined },
      );
      try {
        const data = await fnRef.current(...args);
        if (id !== callId.current) return undefined;
        setState({ status: 'success', data, error: undefined });
        return data;
      } catch (error) {
        if (id === callId.current) setState((s) => ({ status: 'error', data: s.data, error }));
        return undefined;
      }
    },
    [fnRef],
  );

  useEffect(() => {
    if (immediate) void run(...([] as unknown as Args));
    // deps chaqiruvchidan keladi (useEffect kabi)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, run, ...deps]);

  useEffect(
    () => () => {
      // unmount: kutilayotgan javoblar eskirgan hisoblanadi
      callId.current++;
    },
    [],
  );

  return { ...state, run };
}
