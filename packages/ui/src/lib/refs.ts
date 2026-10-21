import type { Ref, RefCallback } from 'react';

/** Tashqi ref (funksiya yoki obyekt) ga elementni yozadi */
export function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as { current: T | null }).current = node;
}

export function mergeRefs<T>(a: Ref<T> | undefined, b: Ref<T> | undefined): RefCallback<T> {
  return (node) => {
    assignRef(a, node);
    assignRef(b, node);
  };
}
