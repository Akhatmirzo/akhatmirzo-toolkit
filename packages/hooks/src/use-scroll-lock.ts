import { resolveTarget, type TargetLike } from './dom-target';
import { useIsomorphicLayoutEffect } from './internal';

export interface UseScrollLockOptions {
  /** Qulflanadigan scroll konteyneri. Standart: `document.body`. */
  target?: TargetLike<HTMLElement>;
}

interface LockState {
  count: number;
  overflow: string;
  paddingRight: string;
  overscrollBehavior: string;
}

// Element → faol qulflar soni va asl inline uslublar
const locks = new Map<HTMLElement, LockState>();

function scrollbarWidth(el: HTMLElement): number {
  if (el === document.body) {
    return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
  }
  const style = getComputedStyle(el);
  const borders =
    (parseFloat(style.borderLeftWidth) || 0) + (parseFloat(style.borderRightWidth) || 0);
  return Math.max(0, el.offsetWidth - el.clientWidth - borders);
}

function lock(el: HTMLElement) {
  const existing = locks.get(el);
  if (existing) {
    existing.count += 1;
    return;
  }
  const { style } = el;
  locks.set(el, {
    count: 1,
    overflow: style.overflow,
    paddingRight: style.paddingRight,
    overscrollBehavior: style.overscrollBehavior,
  });
  // Scrollbar yo'qolganda layout sakramasligi uchun uning kengligini padding bilan qoplaymiz
  const gap = scrollbarWidth(el);
  if (gap > 0) {
    const current = parseFloat(getComputedStyle(el).paddingRight) || 0;
    style.paddingRight = `${current + gap}px`;
  }
  style.overflow = 'hidden';
  // iOS Safari va scroll zanjiri (ichki scroll oxiriga yetganda sahifa siljimasin)
  style.overscrollBehavior = 'none';
}

function unlock(el: HTMLElement) {
  const state = locks.get(el);
  if (!state) return;
  state.count -= 1;
  if (state.count > 0) return;
  locks.delete(el);
  el.style.overflow = state.overflow;
  el.style.paddingRight = state.paddingRight;
  el.style.overscrollBehavior = state.overscrollBehavior;
}

/**
 * Sahifa (yoki `target`) scroll'ini qulflaydi — modal, drawer, mobil menyu uchun. Scrollbar
 * kengligi `padding-right` bilan qoplanadi, layout sakramaydi. Bir nechta qulf bir vaqtda
 * faol bo'lsa hisoblagich ishlaydi: oxirgisi ochilganda asl uslublar tiklanadi.
 * @example
 * const [open, setOpen] = useState(false);
 * useScrollLock(open);
 */
export function useScrollLock(locked: boolean, { target }: UseScrollLockOptions = {}): void {
  // Layout effekt — qulf birinchi bo'yashdan oldin qo'yiladi (scrollbar "miltillamaydi")
  useIsomorphicLayoutEffect(() => {
    if (!locked || typeof document === 'undefined') return;
    const el = target === undefined ? document.body : resolveTarget(target);
    if (!el) return;
    lock(el);
    return () => unlock(el);
  }, [locked, target]);
}
