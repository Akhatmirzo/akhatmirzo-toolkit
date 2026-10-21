import { useCallback, useEffect, useRef, useState } from 'react';

async function writeText(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // eski usulga o'tamiz
    }
  }
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') return false;
  const el = document.createElement('textarea');
  el.value = text;
  el.setAttribute('readonly', '');
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  try {
    el.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    el.remove();
  }
}

export interface UseCopyToClipboardResult {
  /** Oxirgi nusxa muvaffaqiyatli bo'ldi (`resetMs` dan keyin yana `false`). */
  copied: boolean;
  /** Matnni buferga yozadi; muvaffaqiyatni qaytaradi (xatoda `false`, istisno otmaydi). */
  copy: (text: string) => Promise<boolean>;
}

/**
 * Matnni buferga nusxalash. `copied` — `resetMs` davomida `true` (`0` — qaytarilmaydi).
 * @example
 * const { copied, copy } = useCopyToClipboard();
 * <Button onClick={() => copy(code)}>{copied ? 'Nusxalandi' : 'Nusxa olish'}</Button>
 */
export function useCopyToClipboard(resetMs = 2000): UseCopyToClipboardResult {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      const ok = await writeText(text);
      clearTimeout(timer.current);
      setCopied(ok);
      if (ok && resetMs > 0 && Number.isFinite(resetMs)) {
        timer.current = setTimeout(() => setCopied(false), resetMs);
      }
      return ok;
    },
    [resetMs],
  );

  return { copied, copy };
}
