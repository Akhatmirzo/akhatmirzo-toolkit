import { useEffect, useState } from 'react';
import { resolveTarget, type TargetLike } from './dom-target';

/** Element o'lchami (px). */
export interface ElementSize {
  width: number;
  height: number;
}

export interface UseResizeObserverOptions {
  /** Qaysi qutini o'lchash. Standart: `'content-box'`. */
  box?: ResizeObserverBoxOptions;
  /** `false` bo'lsa kuzatilmaydi. Standart: `true`. */
  enabled?: boolean;
}

function readSize(entry: ResizeObserverEntry, box: ResizeObserverBoxOptions): ElementSize {
  const list =
    box === 'border-box'
      ? entry.borderBoxSize
      : box === 'device-pixel-content-box'
        ? entry.devicePixelContentBoxSize
        : entry.contentBoxSize;
  // Eski brauzerlarda massiv emas, bitta obyekt bo'lishi mumkin
  const size = (Array.isArray(list) ? list[0] : list) as ResizeObserverSize | undefined;
  if (size) return { width: size.inlineSize, height: size.blockSize };
  return { width: entry.contentRect.width, height: entry.contentRect.height };
}

/**
 * Element o'lchamini kuzatadi. Bir kadrdagi bir nechta o'zgarish `requestAnimationFrame`
 * bilan bitta yangilanishga birlashtiriladi. Birinchi o'lchovgacha, serverda va
 * `ResizeObserver` yo'q muhitda — `null`.
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const size = useResizeObserver(ref);
 * return <div ref={ref}>{size ? `${size.width} × ${size.height}` : '…'}</div>;
 */
export function useResizeObserver<T extends Element = Element>(
  target: TargetLike<T>,
  { box = 'content-box', enabled = true }: UseResizeObserverOptions = {},
): ElementSize | null {
  const [size, setSize] = useState<ElementSize | null>(null);

  useEffect(() => {
    if (!enabled || typeof ResizeObserver === 'undefined') return;
    const el = resolveTarget<T>(target);
    if (!el) return;

    const hasRaf = typeof requestAnimationFrame === 'function';
    let frame: number | null = null;
    let latest: ElementSize | null = null;

    const commit = () => {
      frame = null;
      const next = latest;
      if (!next) return;
      setSize((prev) =>
        prev && prev.width === next.width && prev.height === next.height ? prev : next,
      );
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (!entry) return;
      latest = readSize(entry, box);
      if (!hasRaf) commit();
      else if (frame === null) frame = requestAnimationFrame(commit);
    });
    observer.observe(el, { box });
    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [target, box, enabled]);

  return size;
}
