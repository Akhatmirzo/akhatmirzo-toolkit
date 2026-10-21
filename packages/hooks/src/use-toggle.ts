import { useCallback, useState } from 'react';

/** Boolean holat: `[value, toggle, setValue]`. */
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue] as const;
}
