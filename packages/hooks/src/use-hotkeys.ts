import { useEffect } from 'react';
import { useLatestRef } from './internal';

export interface UseHotkeysOptions {
  /** `false` bo'lsa tinglanmaydi. Standart: `true`. */
  enabled?: boolean;
  /** Mos kelganda brauzerning standart amalini to'xtatish. Standart: `true`. */
  preventDefault?: boolean;
  /** Input, textarea, select va contenteditable ichida ham ishlash. Standart: `false`. */
  enableOnInputs?: boolean;
}

interface ParsedHotkey {
  key: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
}

const ALIASES: Record<string, string> = {
  esc: 'escape',
  return: 'enter',
  space: ' ',
  spacebar: ' ',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  del: 'delete',
  plus: '+',
  comma: ',',
};

/** Joriy platforma macOS/iOS mi (`mod` → Meta). SSR'da `false`. */
export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent || '';
  return /mac|iphone|ipad|ipod/i.test(platform);
}

function parseCombo(combo: string, apple: boolean): ParsedHotkey | null {
  const parts = combo
    .toLowerCase()
    .split('+')
    .map((p) => p.trim());
  // "mod++" kabi holat: oxirgi bo'sh qism '+' tugmasini bildiradi
  if (parts.length > 1 && parts[parts.length - 1] === '' && parts[parts.length - 2] === '') {
    parts.splice(-2, 2, '+');
  }
  const rawKey = parts.pop();
  if (!rawKey) return null;
  const parsed: ParsedHotkey = {
    key: ALIASES[rawKey] ?? rawKey,
    ctrl: false,
    meta: false,
    alt: false,
    shift: false,
  };
  for (const mod of parts) {
    if (mod === 'mod') parsed[apple ? 'meta' : 'ctrl'] = true;
    else if (mod === 'ctrl' || mod === 'control') parsed.ctrl = true;
    else if (mod === 'meta' || mod === 'cmd' || mod === 'command') parsed.meta = true;
    else if (mod === 'alt' || mod === 'option') parsed.alt = true;
    else if (mod === 'shift') parsed.shift = true;
    else return null;
  }
  return parsed;
}

function splitCombos(keys: string): string[] {
  // "mod+," dagi vergulni ajratuvchi deb hisoblamaslik uchun: vergul + bo'sh joy yoki oddiy vergul
  return keys
    .split(/,(?=\s*[^\s,])/)
    .map((k) => k.trim())
    .filter(Boolean);
}

function matches(event: KeyboardEvent, hk: ParsedHotkey): boolean {
  if (event.ctrlKey !== hk.ctrl || event.metaKey !== hk.meta || event.altKey !== hk.alt) {
    return false;
  }
  const key = (event.key ?? '').toLowerCase();
  const isSymbol = hk.key.length === 1 && !/[a-z0-9]/.test(hk.key);
  // "?" kabi belgilar Shift bilan yoziladi — shift ko'rsatilmagan bo'lsa tekshirilmaydi
  if (!(isSymbol && !hk.shift) && event.shiftKey !== hk.shift) return false;
  if (key === hk.key) return true;
  // macOS'da Alt harfni o'zgartiradi (Alt+K → "˚") — fizik tugma bo'yicha
  if (/^[a-z]$/.test(hk.key)) return event.code === `Key${hk.key.toUpperCase()}`;
  if (/^[0-9]$/.test(hk.key)) return event.code === `Digit${hk.key}`;
  return false;
}

/**
 * Klaviatura hodisasi berilgan kombinatsiya(lar)dan biriga mos keladimi.
 * @example if (matchHotkey(event, 'mod+k, /')) openSearch();
 */
export function matchHotkey(event: KeyboardEvent, keys: string): boolean {
  const apple = isApplePlatform();
  return splitCombos(keys).some((combo) => {
    const hk = parseCombo(combo, apple);
    return hk !== null && matches(event, hk);
  });
}

function isEditable(target: EventTarget | null): boolean {
  if (!target || typeof (target as HTMLElement).tagName !== 'string') return false;
  const el = target as HTMLElement;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

/**
 * Global klaviatura yorliqlari. `mod` — macOS'da ⌘, boshqalarida Ctrl.
 * Bir nechta kombinatsiya vergul bilan: `"mod+k, /"`.
 * @example useHotkeys('mod+k', () => setOpen(true));
 * @example useHotkeys('esc', close, { enabled: open, enableOnInputs: true });
 */
export function useHotkeys(
  keys: string,
  handler: (event: KeyboardEvent) => void,
  { enabled = true, preventDefault = true, enableOnInputs = false }: UseHotkeysOptions = {},
): void {
  const handlerRef = useLatestRef(handler);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    const apple = isApplePlatform();
    const parsed = splitCombos(keys)
      .map((combo) => parseCombo(combo, apple))
      .filter((hk): hk is ParsedHotkey => hk !== null);
    if (parsed.length === 0) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing) return;
      if (!enableOnInputs && isEditable(event.target)) return;
      if (!parsed.some((hk) => matches(event, hk))) return;
      if (preventDefault) event.preventDefault();
      handlerRef.current(event);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [keys, enabled, preventDefault, enableOnInputs, handlerRef]);
}
