import type { UzApostropheStyle, UzScript } from '../text/script';
import { latToCyr } from '../text/translit';

/** Matn qaytaradigan o'zbekcha funksiyalarning umumiy opsiyalari. */
export interface UzScriptOptions {
  /** Natija alifbosi. Default: `'latin'`. Kirill — `latToCyr` orqali. */
  script?: UzScript;
  /**
   * Lotin natijadagi `oʻ gʻ` apostrofi: `'typographic'` — `ʻ` (U+02BB), `'ascii'` — oddiy `'`.
   * Default: `'typographic'`. Kirill natijaga ta'sir qilmaydi.
   */
  apostrophe?: UzApostropheStyle;
}

/**
 * Ichki lug'atdagi (`ʻ` bilan yozilgan) lotin matnni so'ralgan alifbo va apostrofga keltiradi.
 * @internal
 */
export function applyUzScript(text: string, options: UzScriptOptions = {}): string {
  if (options.script === 'cyrillic') return latToCyr(text);
  return options.apostrophe === 'ascii' ? text.replace(/ʻ/g, "'") : text;
}

/** Birinchi harfni katta qiladi. @internal */
export const capitalizeFirst = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
