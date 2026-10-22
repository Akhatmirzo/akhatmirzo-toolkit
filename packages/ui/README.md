# @akhatmirzo/ui

[![npm](https://img.shields.io/npm/v/@akhatmirzo/ui?color=4f46e5)](https://www.npmjs.com/package/@akhatmirzo/ui)
[![npm yuklab olishlar](https://img.shields.io/npm/dm/@akhatmirzo/ui?label=yuklab%20olishlar)](https://www.npmjs.com/package/@akhatmirzo/ui)
[![CI](https://github.com/Akhatmirzo/akhatmirzo-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/Akhatmirzo/akhatmirzo-toolkit/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Litsenziya: MIT](https://img.shields.io/badge/litsenziya-MIT-22c55e)](https://github.com/Akhatmirzo/akhatmirzo-toolkit/blob/main/LICENSE)

**O'zbek tiliga moslangan, klaviatura bilan to'liq boshqariladigan React komponentlar — Tailwind
CSS v4 va Radix UI asosida.**

Hujjatlar, jonli demolar va props jadvallari: **https://toolkit.akhatmirzo.uz**

## Nimasi bilan foydali

- **O'zbekcha standartlar.** Telefon (`+998 90 123 45 67`), Uzcard/Humo kartalari, so'mdagi
  summalar, o'zbekcha kalendar (hafta dushanbadan) uchun tayyor maydonlar. Qidiruvli
  komponentlar lotin va kirill yozuvni bir xil topadi.
- **Accessibility.** Overlay, menyu, select va tablar Radix'ga qurilgan: fokus tuzog'i,
  klaviatura navigatsiyasi, to'g'ri ARIA rollari. `Field` label, tavsif va xatoni boshqaruv
  elementiga o'zi bog'laydi.
- **Light va dark.** Ranglar faqat semantik tokenlardan olinadi — `<html data-theme="dark">`
  qo'yishning o'zi yetarli.
- **Moslashuvchan.** Har bir komponent `className` (tashqi klass ustun), `ref` va qolgan HTML
  atributlarini qabul qiladi. Holatlar `data-*` atributlarida.
- **Yengil.** ESM, `sideEffects: false` — faqat import qilinganlar bundle'ga tushadi.

## O'rnatish

```bash
pnpm add @akhatmirzo/ui @akhatmirzo/tokens
```

Talablar: **React 18+** (19 ham), **Tailwind CSS v4**.

### CSS

```css
/* app.css */
@import 'tailwindcss';
@import '@akhatmirzo/tokens/theme.css';

/* Komponentlardagi klasslarni Tailwind skanerlashi uchun. Yo'l shu CSS faylga nisbatan. */
@source '../node_modules/@akhatmirzo/ui/dist';
```

> [!WARNING]
> `@source` qatori bo'lmasa, komponentlar stillarsiz chiqadi. Masalan, `src/styles/app.css` uchun
> yo'l `'../../node_modules/@akhatmirzo/ui/dist'` bo'ladi.

### Provayderlar

Ilova ildizida bir marta — `toast()`, `confirm()` va tooltiplar shularsiz ishlamaydi:

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

Next.js App Router'da komponentlarni client komponentlarda ishlating (`'use client'`), provayderlarni
esa alohida faylga chiqaring — [qo'llanma](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/installation).

## Misol

```tsx
import { useState } from 'react';
import { Button, Field, PhoneInput, Select, confirm, toast } from '@akhatmirzo/ui';

export function ProfileForm() {
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('tsh');

  async function handleDelete() {
    const ok = await confirm({
      title: "Profilni o'chirasizmi?",
      description: "Bu amalni qaytarib bo'lmaydi.",
      confirmText: "O'chirish",
      variant: 'danger',
    });
    if (ok) toast.success("Profil o'chirildi");
  }

  return (
    <div className="flex max-w-sm flex-col gap-4">
      <Field label="Telefon" description="SMS orqali kod yuboramiz">
        <PhoneInput value={phone} onValueChange={setPhone} />
      </Field>

      <Field label="Viloyat">
        <Select value={region} onValueChange={setRegion}>
          <Select.Item value="tsh">Toshkent</Select.Item>
          <Select.Item value="sam">Samarqand</Select.Item>
        </Select>
      </Field>

      <div className="flex gap-2">
        <Button variant="primary" onClick={() => toast.success('Saqlandi')}>
          Saqlash
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          O'chirish
        </Button>
      </div>
    </div>
  );
}
```

## Komponentlar

| Bo'lim | Komponentlar |
| --- | --- |
| Asoslar     | [Button](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/button) · [IconButton](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/icon-button) · [Kbd](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/kbd) · [Spinner](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/spinner) |
| Formalar    | [Field](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/field) · [Input](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/input) · [Textarea](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/textarea) · [Select](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/select) · [Combobox](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/combobox) · [DatePicker, DateRangePicker, Calendar](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/date-picker) · [PhoneInput, MoneyInput, CardInput, MaskedInput](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/masked-input) · [OtpInput, ResendTimer](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/otp-input) · [FileUpload](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/file-upload) · [PinflInput, PassportInput, InnInput, CarPlateInput, BankAccountInput](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/document-inputs) · [RegionSelect](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/select#regionselect) |
| Tanlov      | [Checkbox](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/checkbox) · [RadioGroup, Radio](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/radio-group) · [Switch](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/switch) · [Slider](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/slider) · [SegmentedControl](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/segmented-control) |
| Ko'rsatish  | [Badge](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/badge) · [Avatar, AvatarGroup](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/avatar) · [Card](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/card) · [Skeleton, SkeletonText](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/skeleton) · [Divider](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/divider) · [Alert](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/alert) · [Progress, ProgressCircle](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/progress) · [EmptyState](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/empty-state) |
| Overlay     | [Dialog, confirm()](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/dialog) · [Drawer](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/drawer) · [Popover](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/popover) · [Tooltip](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/tooltip) · [Toaster, toast()](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/toast) · [DropdownMenu](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/dropdown-menu) · [CommandPalette](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/command-palette) |
| Navigatsiya | [Tabs](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/tabs) · [Accordion](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/accordion) · [Pagination, PaginationInfo](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/pagination) · [Breadcrumb](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/breadcrumb) · [Stepper](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/stepper) · [ScriptProvider, ScriptToggle, Translit](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/script) |
| Ma'lumotlar | [DataTable](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/data-table) · [VirtualList](https://toolkit.akhatmirzo.uz/uz/docs/v0.3/components/virtual-list) |

Shuningdek yordamchilar: `cn` (clsx + tailwind-merge), `buttonVariants`, `badgeVariants`,
`cardVariants`, `kbdVariants`, `spinnerVariants`, `useFieldControl`, `getInitials`,
`getAvatarColor`, `getPhoneDetails`, `getCardDetails`, `isDateSelectable`, `matchesAccept`.

## Umumiy qoidalar

- **O'lcham:** boshqaruv elementlarida `size="sm" | "md" | "lg"` — 32 / 40 / 48 px.
- **Boshqariladigan va boshqarilmaydigan:** `value` + `onValueChange` yoki `defaultValue`.
- **Holatlar:** `data-state`, `data-disabled`, `data-invalid` kabi atributlar — CSS'dan ulanish
  qulay.
- **Standart matnlar** o'zbekcha ("Yopish", "Hech narsa topilmadi") — kerak bo'lsa `labels`,
  `emptyText` kabi props orqali almashtiriladi.

To'liq spetsifikatsiyalar: [specs/](https://github.com/Akhatmirzo/akhatmirzo-toolkit/tree/main/specs).

## Bog'liq paketlar

| Paket                                                                    | Vazifasi                                                |
| ------------------------------------------------------------------------ | ------------------------------------------------------- |
| [`@akhatmirzo/tokens`](https://www.npmjs.com/package/@akhatmirzo/tokens) | Ranglar, tipografiya, soyalar — peer bog'liqlik          |
| [`@akhatmirzo/core`](https://www.npmjs.com/package/@akhatmirzo/core)     | Formatlash va validatsiya — avtomatik o'rnatiladi       |
| [`@akhatmirzo/hooks`](https://www.npmjs.com/package/@akhatmirzo/hooks)   | React hooklar — avtomatik o'rnatiladi                   |

## Litsenziya

[MIT](https://github.com/Akhatmirzo/akhatmirzo-toolkit/blob/main/LICENSE) © Akhatmirzo

---

## English

Accessible React components for Tailwind CSS v4, built on Radix UI and tuned for Uzbek: phone,
card and money inputs, an Uzbek calendar, and search that matches Latin and Cyrillic alike.
Light and dark themes via `<html data-theme="dark">`.

```bash
pnpm add @akhatmirzo/ui @akhatmirzo/tokens
```

```css
@import 'tailwindcss';
@import '@akhatmirzo/tokens/theme.css';
@source '../node_modules/@akhatmirzo/ui/dist'; /* required */
```

Wrap your app once in `TooltipProvider` and `ConfirmProvider`, and render a `<Toaster />`.
Full documentation in English: https://toolkit.akhatmirzo.uz/en/docs/v0.3/introduction
