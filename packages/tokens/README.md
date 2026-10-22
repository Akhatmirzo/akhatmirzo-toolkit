# @akhatmirzo/tokens

[![npm](https://img.shields.io/npm/v/@akhatmirzo/tokens?color=4f46e5)](https://www.npmjs.com/package/@akhatmirzo/tokens)
[![npm yuklab olishlar](https://img.shields.io/npm/dm/@akhatmirzo/tokens?label=yuklab%20olishlar)](https://www.npmjs.com/package/@akhatmirzo/tokens)
[![CI](https://github.com/Akhatmirzo/akhatmirzo-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/Akhatmirzo/akhatmirzo-toolkit/actions/workflows/ci.yml)
[![Litsenziya: MIT](https://img.shields.io/badge/litsenziya-MIT-22c55e)](https://github.com/Akhatmirzo/akhatmirzo-toolkit/blob/main/LICENSE)

**Bitta CSS fayl — ranglar, tipografiya, soyalar, harakat va dark mode. Tailwind CSS v4 `@theme`
bilan.**

Hujjatlar: **https://toolkit.akhatmirzo.uz/uz/docs/v0.4/theming**

Yumshoq va do'stona yo'nalish: indigo + slate, Manrope shrifti, light va dark rejim. Bu paket
[`@akhatmirzo/ui`](https://www.npmjs.com/package/@akhatmirzo/ui) komponentlarining vizual
asosi, lekin o'z sahifalaringizda ham xuddi shu tokenlarni ishlatsangiz, ilova bir butun ko'rinadi.

```bash
pnpm add @akhatmirzo/tokens
```

## Ulash

```css
/* app.css */
@import 'tailwindcss';
@import '@akhatmirzo/tokens/theme.css';
```

Shrift alohida yuklanadi (ixtiyoriy, lekin dizayn shunga moslangan):

```bash
pnpm add @fontsource-variable/manrope
```

```css
@import '@fontsource-variable/manrope';
```

## Dark mode

```html
<html data-theme="dark"></html>
```

Shu atributning o'zi yetarli: barcha semantik tokenlar qorong'i qiymatlarga o'tadi,
`color-scheme` ham o'zgaradi. Tailwind'ning `dark:` varianti ham shu atributga bog'langan —
`dark:bg-surface-muted` kabi klasslar `data-theme="dark"` bo'lganda ishlaydi.

## Nimalar bor

| Guruh       | Tailwind utilitalari                                                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fon va matn | `bg-background`, `bg-surface`, `bg-surface-muted`, `bg-surface-raised`, `text-text`, `text-text-subtle`, `text-text-muted`, `text-text-faint`, `border-border`, `border-border-strong` |
| Brend       | `bg-primary`, `bg-primary-hover`, `text-primary-foreground`, `bg-primary-soft`, `text-primary-soft-foreground`, `text-link`, `bg-overlay`                                       |
| Status      | `bg-{success,warning,danger,info}`, `bg-{…}-soft`, `text-{…}-soft-foreground`                                                                                                   |
| Tipografiya | `font-sans` (Manrope), `font-mono`, `text-xs` … `text-4xl` — qator balandligi va harf oralig'i bilan                                                                            |
| Shakl       | `rounded-sm` / `md` / `lg` / `xl` / `2xl` — 6 / 8 / 12 / 16 / 20 px; `shadow-xs` … `shadow-xl` (dark'da halqa + soya)                                                           |
| Harakat     | `ease-out`, `ease-in`, `ease-in-out`, `ease-spring`; `duration-fast` / `base` / `moderate` / `slow` (100–300 ms); `animate-dialog-in`, `animate-popover-in` ...               |
| Fokus       | `focus-ring`, `focus-ring-within` — faqat klaviatura fokusida ko'rinadigan halqa                                                                                                |
| Qatlamlar   | `z-(--ak-z-dropdown)`, `overlay`, `modal`, `toast`, `tooltip`                                                                                                                   |

Ranglar, soyalar, davomiyliklar va qatlamlar `--ak-*` CSS o'zgaruvchilari sifatida ham mavjud —
masalan `var(--ak-primary)` yoki `duration-(--ak-duration-fast)`. `prefers-reduced-motion`
yoqilganda overlay'lar siljimaydi, faqat yumshoq paydo bo'ladi.

```tsx
<div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
  <p className="text-text">Buyurtma #1024</p>
  <p className="text-sm text-text-muted">1 250 000 so'm · Kecha</p>
  <span className="rounded-md bg-success-soft px-2 text-xs text-success-soft-foreground">
    To'langan
  </span>
</div>
```

## Brend rangini almashtirish

`--ak-primary*` ni o'z CSS'ingizda, `theme.css` dan **keyin** qayta belgilang. Komponentlar shu
zahoti yangi rangga o'tadi:

```css
@import 'tailwindcss';
@import '@akhatmirzo/tokens/theme.css';

:root,
[data-theme='light'] {
  --ak-primary: var(--ak-emerald-600);
  --ak-primary-hover: var(--ak-emerald-700);
  --ak-primary-soft: var(--ak-emerald-50);
  --ak-primary-soft-hover: var(--ak-emerald-100);
  --ak-primary-soft-foreground: var(--ak-emerald-700);
  --ak-link: var(--ak-emerald-600);
}

[data-theme='dark'] {
  --ak-primary: var(--ak-emerald-600);
  --ak-primary-hover: var(--ak-emerald-500);
  --ak-primary-soft: var(--ak-emerald-950);
  --ak-primary-soft-foreground: var(--ak-emerald-300);
  --ak-link: var(--ak-emerald-300);
}
```

Batafsil — [Mavzu va tokenlar](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/theming) va
[Dark mode](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/dark-mode) sahifalarida. Barcha
qiymatlar va dizayn qarorlari:
[DESIGN.md](https://github.com/Akhatmirzo/akhatmirzo-toolkit/blob/main/DESIGN.md).

## Litsenziya

[MIT](https://github.com/Akhatmirzo/akhatmirzo-toolkit/blob/main/LICENSE) © Akhatmirzo

---

## English

Design tokens for Tailwind CSS v4 in a single `theme.css`: semantic colors (`bg-surface`,
`text-text-muted`, `bg-primary-soft` ...), status colors, Manrope typography, radii, shadows,
motion and focus utilities. Every value is also exposed as a `--ak-*` CSS variable.

```css
@import 'tailwindcss';
@import '@akhatmirzo/tokens/theme.css';
```

Dark mode: `<html data-theme="dark">` — Tailwind's `dark:` variant follows the same attribute. To
rebrand, override `--ak-primary*` after the import.

Docs: https://toolkit.akhatmirzo.uz/en/docs/v0.4/theming
