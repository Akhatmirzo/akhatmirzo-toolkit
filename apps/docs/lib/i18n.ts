import { defineI18n } from 'fumadocs-core/i18n';

/**
 * Tillar: `uz` (asosiy) va `en`.
 *
 * Kontent fayllari "dot" konvensiyasida: `button.mdx` — o'zbekcha, `button.en.mdx` — inglizcha.
 * Inglizcha fayl bo'lmasa, sahifa o'zbekcha matn bilan ko'rsatiladi (fallback).
 */
export const i18n = defineI18n({
  languages: ['uz', 'en'],
  defaultLanguage: 'uz',
  parser: 'dot',
  hideLocale: 'never',
});

export type Lang = (typeof i18n.languages)[number];

export function isLang(value: string): value is Lang {
  return (i18n.languages as string[]).includes(value);
}

/** Noma'lum qiymat kelsa — asosiy til */
export function toLang(value: string): Lang {
  return isLang(value) ? value : i18n.defaultLanguage;
}
