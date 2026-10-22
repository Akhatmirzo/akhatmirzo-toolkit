<div align="center">

# @akhatmirzo toolkit

**O'zbek tilida o'ylab yaratilgan React komponentlar, grafiklar va formalar, dizayn tokenlari,
hooklar, yordamchi funksiyalar va tayyor bloklar uchun CLI.**

[![npm](https://img.shields.io/npm/v/@akhatmirzo/ui?label=%40akhatmirzo%2Fui&color=4f46e5)](https://www.npmjs.com/package/@akhatmirzo/ui)
[![npm yuklab olishlar](https://img.shields.io/npm/dm/@akhatmirzo/ui?label=yuklab%20olishlar)](https://www.npmjs.com/package/@akhatmirzo/ui)
[![CI](https://github.com/Akhatmirzo/akhatmirzo-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/Akhatmirzo/akhatmirzo-toolkit/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Litsenziya: MIT](https://img.shields.io/badge/litsenziya-MIT-22c55e)](LICENSE)

[**Hujjatlar**](https://toolkit.akhatmirzo.uz) ·
[O'rnatish](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/installation) ·
[Komponentlar](#komponentlar) ·
[English](#english)

</div>

---

Telefon raqami `+998 90 123 45 67` ko'rinishida yozilsin, summa `1 250 000 so'm` bo'lib chiqsin,
qidiruv "Gʻuzor", "G'uzor" va "Ғузор" ni bir xil topsin, kalendar dushanbadan boshlansin — bularning
hammasi bu yerda **standart holatda** ishlaydi. Har loyihada qaytadan yozish shart emas.

## Nega bu kutubxona?

- **O'zbek tiliga moslik.** Matnlar o'zbekcha, oy va hafta kunlari o'zbekcha, hafta dushanbadan
  boshlanadi. Telefon (`+998`), Uzcard/Humo kartalari, so'mdagi summalar uchun tayyor maydonlar
  bor. Qidiruv lotin va kirill yozuvni, apostrofning barcha shakllarini (`'` `ʻ` `‘` `’`) bir xil
  tushunadi.
- **Accessibility (a11y).** Overlay, menyu va tablar [Radix UI](https://www.radix-ui.com/)
  ustiga qurilgan: fokus boshqaruvi, klaviatura navigatsiyasi va ARIA atributlari o'z joyida.
  Formalarda `Field` label, tavsif va xatoni boshqaruv elementiga avtomatik bog'laydi.
- **Dark mode.** Bitta atribut — `<html data-theme="dark">`. Ranglar semantik tokenlar orqali
  beriladi (`bg-surface`, `text-text-muted`), shuning uchun komponentlar ikkala rejimda ham
  qo'shimcha ishsiz to'g'ri ko'rinadi.
- **Tailwind CSS v4 + Radix.** Stillar sizning Tailwind build'ingizda yaratiladi — runtime
  CSS-in-JS yo'q. Har bir komponent `className` qabul qiladi va tashqi klass ustun turadi.
- **Tree-shaking.** Paketlar ESM, `sideEffects: false`. Faqat import qilgan narsangiz bundle'ga
  tushadi.
- **TypeScript.** `strict` rejimda yozilgan, barcha props va funksiyalar to'liq tiplangan.
- **Grafiklar, formalar, bloklar.** Recharts asosidagi grafiklar, react-hook-form + `zUz` zod
  sxemalari bilan formalar va `npx @akhatmirzo/cli add login` bilan kodingizga ko'chiriladigan
  tayyor bloklar.
- **Bog'liqliksiz yadro.** `@akhatmirzo/core` hech qanday paketga bog'liq emas va React'siz
  ishlaydi — uni backend'da yoki boshqa freymvorkda ham ishlatish mumkin.

## 30 soniyada boshlash

Talablar: **React 18+** va **Tailwind CSS v4**.

**1. O'rnating**

```bash
pnpm add @akhatmirzo/ui @akhatmirzo/tokens
# ixtiyoriy, dizayn shu shriftga moslangan:
pnpm add @fontsource-variable/manrope
```

**2. CSS'ni ulang** — Tailwind'dan keyin:

```css
/* app.css */
@import 'tailwindcss';
@import '@fontsource-variable/manrope';
@import '@akhatmirzo/tokens/theme.css';

/* Tailwind node_modules'ni o'zi skanerlamaydi. Yo'l shu CSS faylga nisbatan yoziladi. */
@source '../node_modules/@akhatmirzo/ui/dist';
```

> [!WARNING]
> `@source` qatori bo'lmasa, komponentlar ko'rinadi, lekin stillarsiz qoladi.

**3. Provayderlarni qo'ying** — ilova ildizida bir marta. `toast()`, `confirm()` va tooltiplar
shularsiz ishlamaydi:

```tsx
import { ConfirmProvider, Toaster, TooltipProvider } from '@akhatmirzo/ui';

export function App() {
  return (
    <TooltipProvider>
      <ConfirmProvider>
        <Routes />
        <Toaster position="bottom-right" />
      </ConfirmProvider>
    </TooltipProvider>
  );
}
```

**4. Birinchi komponent**

```tsx
import { useState } from 'react';
import { Button, Field, PhoneInput, toast } from '@akhatmirzo/ui';

export function ContactForm() {
  const [phone, setPhone] = useState('');

  return (
    <form className="flex max-w-sm flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <Field label="Telefon" description="SMS orqali kod yuboramiz">
        <PhoneInput value={phone} onValueChange={setPhone} />
      </Field>
      <Button type="submit" variant="primary" onClick={() => toast.success('Saqlandi')}>
        Saqlash
      </Button>
    </form>
  );
}
```

Next.js (App Router) bilan ishlatish, dark mode va mavzuni moslash —
[o'rnatish qo'llanmasida](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/installation).

## Paketlar

| Paket                                     | Versiya                                                                                                                | Vazifasi                                                                    |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [`@akhatmirzo/ui`](packages/ui)           | [![npm](https://img.shields.io/npm/v/@akhatmirzo/ui?label=)](https://www.npmjs.com/package/@akhatmirzo/ui)             | 50 ta komponent oilasi (Tailwind v4 + Radix), `/charts` va `/form`          |
| [`@akhatmirzo/tokens`](packages/tokens)   | [![npm](https://img.shields.io/npm/v/@akhatmirzo/tokens?label=)](https://www.npmjs.com/package/@akhatmirzo/tokens)     | Dizayn tokenlari: CSS o'zgaruvchilari va Tailwind v4 `@theme`               |
| [`@akhatmirzo/core`](packages/core)       | [![npm](https://img.shields.io/npm/v/@akhatmirzo/core?label=)](https://www.npmjs.com/package/@akhatmirzo/core)         | Formatlash, validatsiya, matn, hujjat raqamlari, storage va API; `/zod` — `zUz` sxemalari |
| [`@akhatmirzo/hooks`](packages/hooks)     | [![npm](https://img.shields.io/npm/v/@akhatmirzo/hooks?label=)](https://www.npmjs.com/package/@akhatmirzo/hooks)       | 27 ta React hook: `useDebounce`, `useHotkeys`, `useCountdown` va boshqalar   |
| [`@akhatmirzo/cli`](packages/cli)         | [![npm](https://img.shields.io/npm/v/@akhatmirzo/cli?label=)](https://www.npmjs.com/package/@akhatmirzo/cli)           | `npx @akhatmirzo/cli init \| add \| list` — sozlash va tayyor bloklar |

`@akhatmirzo/ui` o'zi `core` va `hooks` ni bog'liqlik sifatida oladi. Ularni kodingizda
to'g'ridan-to'g'ri import qilsangiz, `package.json` ga ham qo'shing.

## Komponentlar

Har bir nom hujjatdagi sahifasiga olib boradi — jonli demo, kod va props jadvali bilan.

| Bo'lim | Komponentlar |
| --- | --- |
| Asoslar     | [Button](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/button) · [IconButton](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/icon-button) · [Kbd](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/kbd) · [Spinner](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/spinner) |
| Formalar    | [Field](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/field) · [Input](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/input) · [Textarea](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/textarea) · [Select](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/select) · [Combobox](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/combobox) · [DatePicker, DateRangePicker, Calendar](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/date-picker) · [PhoneInput, MoneyInput, CardInput, MaskedInput](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/masked-input) · [OtpInput](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/otp-input) · [FileUpload](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/file-upload) · [TagInput](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/tag-input) · [ColorPicker](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/color-picker) · [PinflInput, PassportInput, InnInput, CarPlateInput, BankAccountInput](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/document-inputs) · [RegionSelect](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/select#regionselect) |
| Tanlov      | [Checkbox](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/checkbox) · [RadioGroup](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/radio-group) · [Switch](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/switch) · [Slider](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/slider) · [SegmentedControl](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/segmented-control) · [Rating](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/rating) |
| Ko'rsatish  | [Badge](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/badge) · [Avatar, AvatarGroup](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/avatar) · [Card](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/card) · [Skeleton](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/skeleton) · [Divider](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/divider) · [Alert](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/alert) · [Progress, ProgressCircle](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/progress) · [EmptyState](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/empty-state) |
| Overlay     | [Dialog, confirm()](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/dialog) · [Drawer](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/drawer) · [Popover](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/popover) · [Tooltip](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/tooltip) · [Toast, toast()](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/toast) · [DropdownMenu](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/dropdown-menu) · [CommandPalette](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/command-palette) · [ContextMenu](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/context-menu) · [HoverCard](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/hover-card) |
| Navigatsiya | [Tabs](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/tabs) · [Accordion](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/accordion) · [Pagination, PaginationInfo](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/pagination) · [Breadcrumb](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/breadcrumb) · [Stepper](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/stepper) · [ScriptProvider, ScriptToggle, Translit](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/script) |
| Ma'lumotlar | [DataTable](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/data-table) · [VirtualList](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/virtual-list) · [Charts](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/charts) |
| Layout      | [AppShell, Sidebar](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/app-shell) |

Jami **50 ta komponent oilasi**. Grafiklar `@akhatmirzo/ui/charts` (`recharts` kerak), formalar
esa `@akhatmirzo/ui/form` (`react-hook-form` kerak) kirish nuqtasidan olinadi — asosiy import
ularni tortmaydi.

Umumiy qoidalar: boshqaruv elementlarida `size="sm" | "md" | "lg"` (32 / 40 / 48 px),
`className`, `ref` va qolgan HTML atributlari; holatlar `data-*` atributlarida (`data-state`,
`data-disabled` ...) — ularga CSS'dan bemalol ulanish mumkin.

## Bloklar va CLI

Tayyor sahifa bo'laklari — kirish, ro'yxatdan o'tish, SMS kod, narxlar, dashboard, jadval sahifasi,
sozlamalar, to'lov, AppShell layout. CLI ularni paket ichidan emas, **sizning kodingizga**
ko'chiradi:

```bash
npx @akhatmirzo/cli init        # paketlar + CSS sozlamasi (tokenlar, @source)
npx @akhatmirzo/cli add login   # blokni components/blocks ga ko'chirish
```

Bloklar: [hujjatlarda](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/blocks) · CLI: [packages/cli](packages/cli#readme).

## Core va hooks — qisqa misollar

```ts
import {
  cyrToLat,
  detectCardBrand,
  formatDate,
  formatMoney,
  formatPhone,
  normalizeUz,
  numberToWords,
  parsePhone,
  searchMatch,
  timeAgo,
} from '@akhatmirzo/core';

formatMoney(1250000); // "1 250 000 so'm"
formatPhone('901234567'); // '+998 90 123 45 67'
parsePhone('+998 90 123-45-67'); // { digits: '901234567', operator: '90', valid: true }
detectCardBrand('8600123412341234'); // 'uzcard'
formatDate(new Date(2026, 9, 21), 'd MMMM yyyy, EEEE'); // '21 Oktabr 2026, Chorshanba'
timeAgo(new Date(Date.now() - 5 * 60_000)); // '5 daqiqa oldin'
cyrToLat('Ўзбекистон'); // "O'zbekiston"
normalizeUz('Gʻuzor') === normalizeUz("G'uzor"); // true
searchMatch('Toshkent', 'тош'); // { match: true, ranges: [[0, 4]] }
numberToWords(1_250_000); // 'bir million ikki yuz ellik ming'
```

```ts
import { zUz } from '@akhatmirzo/core/zod'; // zod v4 — ixtiyoriy peer
import { z } from 'zod';

const schema = z.object({ phone: zUz.phone(), pinfl: zUz.pinfl(), amount: zUz.money() });
// '+998 90 123-45-67' → '998901234567', '1 250 000' → 1250000; xatolar o'zbekcha
```

```tsx
import { useState } from 'react';
import { useDebounce, useHotkeys, useLocalStorage } from '@akhatmirzo/hooks';

function Search() {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300); // so'rov 300 ms jimlikdan keyin
  const [recent, setRecent] = useLocalStorage<string[]>('recent', []); // tablar o'rtasida sinxron
  useHotkeys('mod+k', () => document.getElementById('search')?.focus()); // ⌘K / Ctrl+K
  // ...
}
```

Barcha funksiyalar: [core](packages/core#readme) ·
[hooks](packages/hooks#readme) ·
[hujjatlarda](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/core/format).

## Brauzerlar

Komponentlar Tailwind CSS v4 ga tayanadi, shuning uchun qo'llab-quvvatlash ham shunga teng:
**Chrome / Edge 111+**, **Safari 16.4+**, **Firefox 128+**. Internet Explorer va eski Safari
qo'llab-quvvatlanmaydi.

`@akhatmirzo/core` faqat standart JavaScript'dan foydalanadi va Node 20+ da ham ishlaydi; brauzer
API'lariga (`localStorage`, `fetch`) tegadigan funksiyalar SSR'da xavfsiz.

## Rivojlantirish

Talablar: **Node 20+**, **pnpm 9**.

```bash
git clone https://github.com/Akhatmirzo/akhatmirzo-toolkit.git
cd akhatmirzo-toolkit
pnpm install
pnpm dev                      # playground → http://localhost:5173
```

| Buyruq                     | Nima qiladi                                                       |
| -------------------------- | ----------------------------------------------------------------- |
| `pnpm dev`                 | Playground — paketlar `src` dan, HMR bilan                        |
| `pnpm test`                | Barcha testlar (Vitest + Testing Library)                         |
| `pnpm typecheck`           | TypeScript tekshiruvi                                             |
| `pnpm lint`                | ESLint                                                            |
| `pnpm format`              | Prettier bilan formatlash                                         |
| `pnpm build`               | Paketlarni `dist/` ga build qilish (tsup)                         |
| `pnpm check`               | CI bilan bir xil: format → lint → typecheck → test → build        |
| `pnpm changeset`           | O'zgarishni keyingi relizga yozib qo'yish                         |
| `pnpm --filter docs dev`   | Hujjatlar sayti → http://localhost:3000 (avval `pnpm build`)      |

### Tuzilma

```
packages/
  cli/       @akhatmirzo/cli     — init / add / list
  core/      @akhatmirzo/core    — toza TypeScript funksiyalar
  hooks/     @akhatmirzo/hooks   — React hooklar
  tokens/    @akhatmirzo/tokens  — theme.css
  ui/        @akhatmirzo/ui      — komponentlar
apps/
  playground/  Vite ilova — har bir komponentning jonli sahifasi
  docs/        Next.js + Fumadocs — hujjatlar sayti (uz/en, versiyalar bilan)
specs/       Komponent spetsifikatsiyalari
```

- **Paketlar manbadan ishlatiladi.** Har bir paketning `exports` ida `source` sharti bor —
  playground va TypeScript shu orqali `src/*.ts` ni oladi, ishlab chiqishda build kerak emas.
  Nashr qilingan paketda `dist/` ishlatiladi.
- **Hujjatlar sayti** paketlarni `dist/` dan oladi, shuning uchun uni ishga tushirishdan oldin
  `pnpm build` qiling. Batafsil: [apps/docs/README.md](apps/docs/README.md).
- **TypeScript `~6.0`** ga qotirilgan: `typescript-eslint` hozircha undan yangi versiyalarni
  qo'llab-quvvatlamaydi.

Loyiha hujjatlari: [PLAN.md](PLAN.md) (reja) · [DESIGN.md](DESIGN.md) (dizayn tizimi) ·
[specs/](specs/) (spetsifikatsiyalar).

## Hissa qo'shish

Xato topdingizmi yoki g'oyangiz bormi — [issue oching](https://github.com/Akhatmirzo/akhatmirzo-toolkit/issues).
Pull request yuborishdan oldin:

1. Yangi branch oching va o'zgarishni kiriting. Komponent o'zgarsa — uning
   [spetsifikatsiyasi](specs/) va [konvensiyalarga](specs/00-conventions.md) mos bo'lsin.
2. Testlarni yozing yoki yangilang (`packages/*/src/**/*.test.ts(x)`).
3. `pnpm check` to'liq o'tishiga ishonch hosil qiling — CI ham aynan shuni tekshiradi.
4. Paketga ta'sir qiladigan o'zgarish uchun `pnpm changeset` bilan yozuv qo'shing.

Uslub: TypeScript `strict`, Prettier (`singleQuote`, `printWidth: 100`), ranglar faqat semantik
tokenlar orqali — hex qiymatlar komponent kodida ishlatilmaydi.

## Versiyalash

Versiyalar [Changesets](https://github.com/changesets/changesets) bilan boshqariladi va
[SemVer](https://semver.org/) ga amal qiladi. `1.0` gacha minor versiya (`0.1` → `0.2`)
API'ni o'zgartirishi mumkin — har bir o'zgarish paketning `CHANGELOG.md` faylida yoziladi.

```bash
pnpm changeset            # o'zgarish turini (patch / minor / major) va tavsifini yozing
pnpm version-packages     # versiyalar va CHANGELOG'larni yangilash
pnpm release              # build + npm'ga nashr
```

Hujjatlar sayti har bir minor versiya uchun alohida saqlanadi (`v0.1`, `v0.2` ...) — eski
versiyani ishlatayotgan bo'lsangiz ham, unga mos sahifalarni topasiz.

O'zgarishlar tarixi: [ui](packages/ui/CHANGELOG.md) · [core](packages/core/CHANGELOG.md) ·
[hooks](packages/hooks/CHANGELOG.md) · [tokens](packages/tokens/CHANGELOG.md) ·
[cli](packages/cli/CHANGELOG.md).

## Litsenziya

[MIT](LICENSE) © 2026 Akhatmirzo

---

## English

**React components, charts and forms, design tokens, hooks, utilities and a blocks CLI — built
with Uzbek in mind.**

Phone numbers render as `+998 90 123 45 67`, amounts as `1 250 000 so'm`, search treats Latin and
Cyrillic (and every apostrophe variant) as the same text, and calendars start on Monday — all out
of the box.

- **Docs:** https://toolkit.akhatmirzo.uz (Uzbek and English, versioned)
- **Stack:** React 18+, Tailwind CSS v4, Radix UI. ESM-only, tree-shakeable, fully typed.
- **Accessible:** focus management, keyboard navigation and ARIA come from Radix; `Field` wires
  labels, descriptions and errors to its control.
- **Dark mode:** set `<html data-theme="dark">`. Components use semantic tokens, so both themes
  just work.

### Quick start

```bash
pnpm add @akhatmirzo/ui @akhatmirzo/tokens
```

```css
@import 'tailwindcss';
@import '@akhatmirzo/tokens/theme.css';
@source '../node_modules/@akhatmirzo/ui/dist'; /* required: lets Tailwind see component classes */
```

```tsx
import { Button, ConfirmProvider, Toaster, TooltipProvider, toast } from '@akhatmirzo/ui';

export function App() {
  return (
    <TooltipProvider>
      <ConfirmProvider>
        <Button variant="primary" onClick={() => toast.success('Saved')}>
          Save
        </Button>
        <Toaster />
      </ConfirmProvider>
    </TooltipProvider>
  );
}
```

### Packages

| Package              | What it does                                                    |
| -------------------- | --------------------------------------------------------------- |
| `@akhatmirzo/ui`     | 50 component families (Tailwind v4 + Radix); `/charts` (Recharts) and `/form` (react-hook-form) |
| `@akhatmirzo/tokens` | Design tokens as CSS variables and a Tailwind v4 `@theme`       |
| `@akhatmirzo/core`   | Formatting, validation, text, identifiers, storage and API helpers — no deps; `/zod` with `zUz` schemas |
| `@akhatmirzo/hooks`  | 27 React hooks: `useDebounce`, `useHotkeys`, `useCountdown` ... |
| `@akhatmirzo/cli`    | `npx @akhatmirzo/cli init \| add \| list` — setup and ready-made blocks |

Ready-made blocks (login, register, OTP, pricing, dashboard, data table page, settings, checkout,
app shell) are copied into your own code with `npx @akhatmirzo/cli add login`.

Browser support follows Tailwind CSS v4: Chrome/Edge 111+, Safari 16.4+, Firefox 128+.

Contributing: open an issue or a PR; run `pnpm check` and add a changeset with `pnpm changeset`.
Releases are managed with Changesets. Licensed under [MIT](LICENSE).
