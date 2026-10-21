# @akhatmirzo toolkit

Shaxsiy frontend kutubxona: yordamchi funksiyalar, React hooklar, dizayn tokenlari va komponentlar.

| Paket | Vazifasi |
|---|---|
| [`@akhatmirzo/core`](packages/core) | Toza TypeScript funksiyalar (React'siz, bog'liqliksiz) |
| [`@akhatmirzo/hooks`](packages/hooks) | React hooklar |
| [`@akhatmirzo/tokens`](packages/tokens) | Dizayn tokenlari — CSS o'zgaruvchilari + Tailwind v4 `@theme` |
| [`@akhatmirzo/ui`](packages/ui) | Komponentlar (Tailwind v4 + Radix) |
| [`apps/playground`](apps/playground) | Komponentlarni jonli sinash uchun Vite ilova |

Reja: [PLAN.md](PLAN.md) · Dizayn: [DESIGN.md](DESIGN.md) · Spetsifikatsiyalar: [specs/](specs/) · Prototip: [prototype/index.html](prototype/index.html)

## Ishga tushirish

Talablar: Node 20+, pnpm 9.

```bash
pnpm install
pnpm dev          # playground → http://localhost:5173
```

## Buyruqlar

| Buyruq | Nima qiladi |
|---|---|
| `pnpm dev` | Playground (paketlar `src` dan, HMR bilan) |
| `pnpm test` | Barcha paketlar testlari (Vitest) |
| `pnpm typecheck` | TypeScript tekshiruvi |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier bilan formatlash |
| `pnpm build` | Paketlarni `dist/` ga build qilish (tsup) |
| `pnpm check` | Hammasi ketma-ket: format → lint → typecheck → test → build |
| `pnpm changeset` | O'zgarishni versiyalash uchun yozib qo'yish |

## Ilovada ulash

```css
/* app.css */
@import 'tailwindcss';
@import '@akhatmirzo/tokens/theme.css';
@source '../node_modules/@akhatmirzo/ui';   /* komponent klasslarini skanerlash — unutmang! */
```

Dark mode: `<html data-theme="dark">`.

## Qanday ishlaydi

- **Paketlar manbadan ishlatiladi.** Har bir paketning `exports` ida `source` sharti bor; playground (Vite) va TypeScript shu shart orqali `src/*.ts` ni oladi, shuning uchun ishlab chiqishda build kerak emas. Nashr qilinganda `dist/` ishlatiladi.
- **TypeScript `~6.0`** ga qotirilgan: `typescript-eslint` hozircha TS 6.1+ / 7 ni qo'llab-quvvatlamaydi.
