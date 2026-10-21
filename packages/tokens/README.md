# @akhatmirzo/tokens

Dizayn tokenlari: CSS o'zgaruvchilari va Tailwind CSS v4 `@theme`. Yumshoq va do'stona yo'nalish — indigo + slate, Manrope shrifti, light va dark rejim.

```bash
pnpm add @akhatmirzo/tokens
```

## Ulash

```css
/* app.css */
@import 'tailwindcss';
@import '@akhatmirzo/tokens/theme.css';
```

Dark rejim: `<html data-theme="dark">` (`dark:` utilitalari ham shu atributga bog'langan).

Shrift alohida yuklanadi, masalan: `pnpm add @fontsource-variable/manrope` va `@import '@fontsource-variable/manrope';`.

## Nimalar bor

| Guruh | Tailwind utilitalari |
|---|---|
| Ranglar | `bg-background`, `bg-surface`, `bg-surface-muted`, `bg-surface-raised`, `text-text`, `text-text-muted`, `text-text-faint`, `border-border`, `bg-primary`, `bg-primary-soft`, `text-link`, `bg-overlay` ... |
| Status | `bg-{success,warning,danger,info}`, `bg-{…}-soft`, `text-{…}-soft-foreground` |
| Tipografiya | `font-sans` (Manrope), `font-mono`, `text-xs` … `text-4xl` (qator balandligi va harf oralig'i bilan) |
| Shakl | `rounded-sm/md/lg/xl/2xl` (6/8/12/16/20), `shadow-xs` … `shadow-xl` (dark'da halqa + soya) |
| Harakat | `ease-out/in/in-out/spring`, `duration-fast/base/moderate/slow`, overlay animatsiyalari (`animate-dialog-in`, `animate-popover-in` ...) |
| Fokus | `focus-ring`, `focus-ring-within` |
| Qatlamlar | `z-(--ak-z-dropdown \| overlay \| modal \| toast \| tooltip)` |

Barcha qiymatlar `--ak-*` CSS o'zgaruvchilari orqali ham mavjud (masalan `var(--ak-primary)`). Brend rangini almashtirish uchun `--ak-primary*` ni o'z CSS'ingizda qayta belgilang.

To'liq qiymatlar: [DESIGN.md](https://github.com/Akhatmirzo/akhatmirzo-toolkit/blob/main/DESIGN.md).

## Litsenziya

MIT
