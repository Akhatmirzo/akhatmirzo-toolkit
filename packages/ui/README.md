# @akhatmirzo/ui

[![npm](https://img.shields.io/npm/v/@akhatmirzo/ui?color=4f46e5)](https://www.npmjs.com/package/@akhatmirzo/ui)
[![npm yuklab olishlar](https://img.shields.io/npm/dm/@akhatmirzo/ui?label=yuklab%20olishlar)](https://www.npmjs.com/package/@akhatmirzo/ui)
[![CI](https://github.com/Akhatmirzo/akhatmirzo-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/Akhatmirzo/akhatmirzo-toolkit/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Litsenziya: MIT](https://img.shields.io/badge/litsenziya-MIT-22c55e)](https://github.com/Akhatmirzo/akhatmirzo-toolkit/blob/main/LICENSE)

**O'zbek tiliga moslangan, klaviatura bilan to'liq boshqariladigan 50 ta React komponent oilasi —
Tailwind CSS v4 va Radix UI asosida.** Grafiklar (`@akhatmirzo/ui/charts`), formalar
(`@akhatmirzo/ui/form`) va CLI orqali ko'chiriladigan tayyor bloklar bilan.

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
- **Yengil.** ESM, `sideEffects: false` — faqat import qilinganlar bundle'ga tushadi. Grafiklar
  va formalar alohida kirish nuqtalarida: `recharts` va `react-hook-form` faqat ular kerak
  bo'lganda o'rnatiladi.

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
esa alohida faylga chiqaring — [qo'llanma](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/installation).

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
| Asoslar     | [Button](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/button) · [IconButton](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/icon-button) · [Kbd](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/kbd) · [Spinner](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/spinner) |
| Formalar    | [Field](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/field) · [Input](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/input) · [Textarea](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/textarea) · [Select](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/select) · [Combobox](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/combobox) · [DatePicker, DateRangePicker, Calendar](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/date-picker) · [PhoneInput, MoneyInput, CardInput, MaskedInput](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/masked-input) · [OtpInput, ResendTimer](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/otp-input) · [FileUpload](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/file-upload) · [TagInput](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/tag-input) · [ColorPicker](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/color-picker) · [PinflInput, PassportInput, InnInput, CarPlateInput, BankAccountInput](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/document-inputs) · [RegionSelect](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/select#regionselect) |
| Tanlov      | [Checkbox](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/checkbox) · [RadioGroup, Radio](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/radio-group) · [Switch](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/switch) · [Slider](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/slider) · [SegmentedControl](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/segmented-control) · [Rating](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/rating) |
| Ko'rsatish  | [Badge](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/badge) · [Avatar, AvatarGroup](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/avatar) · [Card](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/card) · [Skeleton, SkeletonText](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/skeleton) · [Divider](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/divider) · [Alert](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/alert) · [Progress, ProgressCircle](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/progress) · [EmptyState](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/empty-state) |
| Overlay     | [Dialog, confirm()](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/dialog) · [Drawer](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/drawer) · [Popover](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/popover) · [Tooltip](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/tooltip) · [Toaster, toast()](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/toast) · [DropdownMenu](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/dropdown-menu) · [CommandPalette](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/command-palette) · [ContextMenu](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/context-menu) · [HoverCard](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/hover-card) |
| Navigatsiya | [Tabs](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/tabs) · [Accordion](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/accordion) · [Pagination, PaginationInfo](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/pagination) · [Breadcrumb](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/breadcrumb) · [Stepper](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/stepper) · [ScriptProvider, ScriptToggle, Translit](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/script) |
| Ma'lumotlar | [DataTable](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/data-table) · [VirtualList](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/virtual-list) · [Charts](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/charts) |
| Layout      | [AppShell, Sidebar](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/app-shell) |

Jami **50 ta komponent oilasi** (jadvaldagi har bir havola — bitta oila).

Shuningdek yordamchilar: `cn` (clsx + tailwind-merge), `buttonVariants`, `badgeVariants`,
`cardVariants`, `kbdVariants`, `spinnerVariants`, `useFieldControl`, `getInitials`,
`getAvatarColor`, `getPhoneDetails`, `getCardDetails`, `isDateSelectable`, `matchesAccept`.

## Grafiklar — `@akhatmirzo/ui/charts`

Recharts asosidagi tayyor grafiklar: `AreaChart`, `BarChart`, `LineChart`, `DonutChart`,
`Sparkline` va o'z grafigingiz uchun primitivlar (`ChartContainer`, `ChartTooltip`,
`ChartLegend`, `chartColors`). Ranglar tokenlardan olinadi — dark rejimda o'zi moslashadi.
`recharts` — ixtiyoriy peer bog'liqlik, asosiy `@akhatmirzo/ui` importi uni tortmaydi:

```bash
pnpm add recharts
```

```tsx
import { AreaChart } from '@akhatmirzo/ui/charts';

const sales = [
  { month: 'Yan', tushum: 42_500_000, xarajat: 28_300_000 },
  { month: 'Fev', tushum: 38_900_000, xarajat: 26_100_000 },
  { month: 'Mar', tushum: 51_200_000, xarajat: 30_400_000 },
];

export function SalesChart() {
  return (
    <AreaChart
      aria-label="Oylik tushum va xarajat"
      data={sales}
      index="month"
      series={[
        { key: 'tushum', label: 'Tushum' },
        { key: 'xarajat', label: 'Xarajat', color: 'amber' },
      ]}
      height={280}
    />
  );
}
```

Batafsil: [Charts](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/charts).

## Formalar — `@akhatmirzo/ui/form`

`react-hook-form` ustidagi yupqa qatlam: `FormField` label, tavsif, xato matni va qiymatni
istalgan komponentga (Input, PhoneInput, Select, TagInput, RegionSelect ...) o'zi ulaydi.
O'zbekcha maydonlar uchun [`@akhatmirzo/core/zod`](https://www.npmjs.com/package/@akhatmirzo/core)
dagi `zUz` sxemalari bilan juda qulay. Bog'liqliklar — ixtiyoriy peer:

```bash
pnpm add react-hook-form @hookform/resolvers zod
```

```tsx
import { zUz } from '@akhatmirzo/core/zod';
import { PhoneInput, PinflInput } from '@akhatmirzo/ui';
import { Form, FormField, FormRootError, FormSubmit } from '@akhatmirzo/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({ phone: zUz.phone(), pinfl: zUz.pinfl() });

export function ProfileForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', pinfl: '' },
  });

  return (
    <Form form={form} onSubmit={(data) => save(data)} className="flex flex-col gap-4">
      <FormField name="phone" label="Telefon" description="SMS kod yuboriladi">
        <PhoneInput />
      </FormField>
      <FormField name="pinfl" label="JShShIR">
        <PinflInput />
      </FormField>
      <FormRootError />
      <FormSubmit>Saqlash</FormSubmit>
    </Form>
  );
}
```

`onSubmit` ga tozalangan qiymat keladi (`data.phone === '998901234567'`). Maxsus komponentlar
uchun — `useFormField()` yoki `FormField render={(field) => ...}`. Batafsil:
[Form](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/components/form).

## Bloklar va CLI

Tayyor sahifa bo'laklari — kirish, ro'yxatdan o'tish, SMS kod, narxlar, dashboard, jadval
sahifasi, sozlamalar, to'lov, AppShell layout. Bloklar paket ichida emas: CLI ularni
**sizning kodingizga** ko'chiradi, xohlaganingizcha o'zgartirasiz.

```bash
npx @akhatmirzo/cli init        # paketlar + CSS sozlamasi
npx @akhatmirzo/cli add login   # blokni loyihaga ko'chirish
```

Bloklar: [hujjatlarda](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/blocks) · CLI: [`@akhatmirzo/cli`](https://www.npmjs.com/package/@akhatmirzo/cli).

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
| [`@akhatmirzo/cli`](https://www.npmjs.com/package/@akhatmirzo/cli) | `init` va tayyor bloklarni ko'chirish (`npx`) |

## Litsenziya

[MIT](https://github.com/Akhatmirzo/akhatmirzo-toolkit/blob/main/LICENSE) © Akhatmirzo

---

## English

50 accessible React component families for Tailwind CSS v4, built on Radix UI and tuned for
Uzbek: phone, card and money inputs, an Uzbek calendar, and search that matches Latin and Cyrillic
alike. Light and dark themes via `<html data-theme="dark">`.

```bash
pnpm add @akhatmirzo/ui @akhatmirzo/tokens
```

```css
@import 'tailwindcss';
@import '@akhatmirzo/tokens/theme.css';
@source '../node_modules/@akhatmirzo/ui/dist'; /* required */
```

Wrap your app once in `TooltipProvider` and `ConfirmProvider`, and render a `<Toaster />`.

Optional entry points:

- `@akhatmirzo/ui/charts` — `AreaChart`, `BarChart`, `LineChart`, `DonutChart`, `Sparkline` and
  chart primitives (requires `recharts`).
- `@akhatmirzo/ui/form` — `Form`, `FormField`, `FormSubmit`, `FormRootError`, `useFormField` on
  top of react-hook-form (requires `react-hook-form`; `@hookform/resolvers` and `zod` recommended).

Ready-made blocks (login, pricing, dashboard ...) are copied into your code with the CLI:
`npx @akhatmirzo/cli add login`.
Full documentation in English: https://toolkit.akhatmirzo.uz/en/docs/v0.4/introduction
