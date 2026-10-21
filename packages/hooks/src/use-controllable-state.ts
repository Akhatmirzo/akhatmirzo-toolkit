import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useIsomorphicLayoutEffect, useLatestRef } from './internal';

export interface UseControllableStateParams<T> {
  /** Boshqariladigan qiymat (`undefined` — boshqarilmaydi). */
  value?: T;
  /** Boshqarilmaydigan rejimdagi boshlang'ich qiymat. */
  defaultValue?: T;
  /** Qiymat o'zgarganda chaqiriladi (ikkala rejimda ham). */
  onChange?: (value: T) => void;
}

/**
 * Boshqariladigan (`value`) va boshqarilmaydigan (`defaultValue`) komponentlar uchun holat.
 * `onChange` faqat qiymat haqiqatan o'zgarganda chaqiriladi.
 * @example
 * const [open, setOpen] = useControllableState({
 *   value: props.open,
 *   defaultValue: false,
 *   onChange: props.onOpenChange,
 * });
 */
export function useControllableState<T>(
  params: UseControllableStateParams<T> & { defaultValue: T },
): [T, Dispatch<SetStateAction<T>>];
export function useControllableState<T>(
  params: UseControllableStateParams<T>,
): [T | undefined, Dispatch<SetStateAction<T | undefined>>];
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
  const [internal, setInternal] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  const controlledRef = useLatestRef(controlled);
  const onChangeRef = useLatestRef(onChange);
  // Boshqarilmaydigan rejimda bir tickdagi ketma-ket chaqiruvlar yig'ilishi uchun setter ham yozadi
  const currentRef = useRef(current);
  useIsomorphicLayoutEffect(() => {
    currentRef.current = current;
  });

  const setValue = useCallback<Dispatch<SetStateAction<T | undefined>>>(
    (next) => {
      const prev = currentRef.current;
      const resolved =
        typeof next === 'function' ? (next as (p: T | undefined) => T | undefined)(prev) : next;
      if (Object.is(resolved, prev)) return;
      // Boshqariladigan rejimda ota rad etishi mumkin — ref faqat `value` dan yangilanadi
      if (!controlledRef.current) {
        currentRef.current = resolved;
        setInternal(resolved);
      }
      onChangeRef.current?.(resolved as T);
    },
    [controlledRef, onChangeRef],
  );

  return [current, setValue];
}
