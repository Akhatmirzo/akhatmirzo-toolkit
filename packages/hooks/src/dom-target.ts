import type { RefObject } from 'react';

/** DOM bilan ishlovchi hooklar qabul qiladigan nishon: ref, elementning o'zi yoki `null`. */
export type TargetLike<T> = RefObject<T | null> | T | null | undefined;

function isRefObject<T>(value: unknown): value is RefObject<T | null> {
  return (
    value !== null &&
    typeof value === 'object' &&
    'current' in value &&
    !('addEventListener' in value)
  );
}

/** Ref yoki elementdan haqiqiy qiymatni oladi. Faqat effekt ichida chaqiring. */
export function resolveTarget<T>(target: TargetLike<T>): T | null {
  if (target == null) return null;
  return isRefObject<T>(target) ? target.current : target;
}
