import { useCallback, useState } from 'react';

export interface UseStepOptions {
  /** Boshlang'ich qadam (0 dan). Standart: `0`. */
  initial?: number;
}

/** `useStep` natijasi. */
export interface UseStepResult {
  /** Joriy qadam, 0 dan `count - 1` gacha. */
  step: number;
  /** Keyingi qadam (oxirgisida o'zgarmaydi). */
  next: () => void;
  /** Oldingi qadam (birinchisida o'zgarmaydi). */
  prev: () => void;
  /** Berilgan qadamga o'tish (chegaraga qisiladi). */
  goTo: (step: number) => void;
  /** `initial` qadamga qaytish. */
  reset: () => void;
  isFirst: boolean;
  isLast: boolean;
  /** 0 (birinchi qadam) dan 1 (oxirgi qadam) gacha. */
  progress: number;
}

const clamp = (value: number, count: number) =>
  Math.min(Math.max(0, Math.trunc(value) || 0), Math.max(0, count - 1));

/**
 * Ko'p bosqichli jarayon (wizard, `Stepper`) holati. Qadam doim `0..count - 1` oralig'ida;
 * `count` kamaysa, joriy qadam ham chegaraga qisiladi.
 * @example
 * const { step, next, prev, isFirst, isLast } = useStep(4);
 * <Stepper steps={steps} value={step} />
 * <Button disabled={isFirst} onClick={prev}>Orqaga</Button>
 * <Button onClick={next}>{isLast ? 'Yakunlash' : 'Davom etish'}</Button>
 */
export function useStep(count: number, { initial = 0 }: UseStepOptions = {}): UseStepResult {
  const [raw, setRaw] = useState(initial);
  const step = clamp(raw, count);

  const goTo = useCallback((value: number) => setRaw(clamp(value, count)), [count]);
  const next = useCallback(() => setRaw((s) => clamp(clamp(s, count) + 1, count)), [count]);
  const prev = useCallback(() => setRaw((s) => clamp(clamp(s, count) - 1, count)), [count]);
  const reset = useCallback(() => setRaw(initial), [initial]);

  return {
    step,
    next,
    prev,
    goTo,
    reset,
    isFirst: step === 0,
    isLast: step >= count - 1,
    progress: count <= 1 ? 1 : step / (count - 1),
  };
}
