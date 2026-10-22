import { useCallback, useEffect, useRef, useState } from 'react';
import { useLatestRef } from './internal';

export interface UseCountdownOptions {
  /** Mount'da o'zi boshlansinmi. Standart: `true`. */
  autoStart?: boolean;
  /** Hisob 0 ga yetganda — har bir yugurishda bir marta. */
  onEnd?: () => void;
}

/** `useCountdown` natijasi. */
export interface UseCountdownResult {
  /** Qolgan butun soniyalar (yuqoriga yaxlitlangan). */
  remaining: number;
  isRunning: boolean;
  /** Davom ettiradi; hisob tugagan bo'lsa (`0`) — `seconds` dan qaytadan boshlaydi. */
  start: () => void;
  /** To'xtatib turadi (qolgan vaqt saqlanadi). */
  pause: () => void;
  /** `seconds` ga qaytaradi va to'xtatadi. */
  reset: () => void;
  /** `seconds` dan darhol qaytadan boshlaydi (`reset` + `start`). */
  restart: () => void;
  /** `"m:ss"` — masalan `"0:59"`, `"2:05"`. */
  formatted: string;
}

const formatTime = (total: number) =>
  `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;

/**
 * Teskari sanoq taymeri (SMS kodni qayta yuborish, taklif muddati). Vaqt `Date.now()` farqi
 * bilan hisoblanadi — fon tabda taymerlar sekinlashsa ham natija to'g'ri bo'ladi.
 *
 * - `start()` — pauzadan davom ettiradi; tugagan bo'lsa `seconds` dan qayta boshlaydi.
 * - `reset()` — `seconds` ga qaytaradi va to'xtatadi; `restart()` — qaytaradi va boshlaydi.
 * - `seconds` o'zgarsa joriy sanoqqa ta'sir qilmaydi — keyingi `reset` / `restart` / tugagandan
 *   keyingi `start` da qo'llanadi.
 * @example
 * const { formatted, isRunning, restart } = useCountdown(60);
 * <Button disabled={isRunning} onClick={() => { sendSms(); restart(); }}>
 *   {isRunning ? `Kodni qayta yuborish (${formatted})` : 'Kodni qayta yuborish'}
 * </Button>
 */
export function useCountdown(
  seconds: number,
  { autoStart = true, onEnd }: UseCountdownOptions = {},
): UseCountdownResult {
  const total = Math.max(0, Math.ceil(seconds) || 0);
  const totalRef = useLatestRef(total);
  const onEndRef = useLatestRef(onEnd);

  const [remaining, setRemaining] = useState(total);
  const [isRunning, setIsRunning] = useState(autoStart && total > 0);
  // Har bir start — yangi taymer (effekt qaytadan ishga tushadi)
  const [runId, setRunId] = useState(0);
  /** Pauzada qolgan vaqt (ms). */
  const leftMsRef = useRef(total * 1000);
  /** Ishlayotganda tugash vaqti (`Date.now()` bo'yicha). */
  const endAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) return;
    if (endAtRef.current === null) endAtRef.current = Date.now() + leftMsRef.current;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      const endAt = endAtRef.current;
      if (endAt === null) return;
      const left = endAt - Date.now();
      if (left <= 0) {
        endAtRef.current = null;
        leftMsRef.current = 0;
        setRemaining(0);
        setIsRunning(false);
        onEndRef.current?.();
        return;
      }
      setRemaining(Math.ceil(left / 1000));
      // Keyingi butun soniya chegarasigacha kutiladi
      timer = setTimeout(tick, left % 1000 || 1000);
    };

    const left = endAtRef.current - Date.now();
    timer = setTimeout(tick, left > 0 ? left % 1000 || 1000 : 0);
    return () => clearTimeout(timer);
  }, [isRunning, runId, onEndRef]);

  const start = useCallback(() => {
    if (endAtRef.current !== null) return;
    if (leftMsRef.current <= 0) {
      leftMsRef.current = totalRef.current * 1000;
      setRemaining(totalRef.current);
    }
    if (leftMsRef.current <= 0) return;
    endAtRef.current = Date.now() + leftMsRef.current;
    setIsRunning(true);
    setRunId((n) => n + 1);
  }, [totalRef]);

  const pause = useCallback(() => {
    const endAt = endAtRef.current;
    if (endAt !== null) leftMsRef.current = Math.max(0, endAt - Date.now());
    endAtRef.current = null;
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    endAtRef.current = null;
    leftMsRef.current = totalRef.current * 1000;
    setRemaining(totalRef.current);
    setIsRunning(false);
  }, [totalRef]);

  const restart = useCallback(() => {
    reset();
    start();
  }, [reset, start]);

  return { remaining, isRunning, start, pause, reset, restart, formatted: formatTime(remaining) };
}
