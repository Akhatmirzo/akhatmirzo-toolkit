# 8-daraja: ekotizim — formalar, bloklar, CLI

> Holat: ✅ tasdiqlandi (avtomatik bosqich) · Umumiy qoidalar: [00-conventions.md](00-conventions.md)
> Reja: `@akhatmirzo/ui` (minor, `./form`), `@akhatmirzo/core` (minor, `./zod`), **yangi paket** `@akhatmirzo/cli@0.1.0`; docs'da yangi bo'lim "Bloklar".

---

## A. Formalar — `@akhatmirzo/ui/form` va `@akhatmirzo/core/zod`

### `@akhatmirzo/ui/form` (react-hook-form — ixtiyoriy peer)

Alohida kirish nuqtasi: asosiy `@akhatmirzo/ui` importi `react-hook-form` ni tortmaydi.

```tsx
import { Form, FormField, FormSubmit, FormRootError } from '@akhatmirzo/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { zUz } from '@akhatmirzo/core/zod';

const schema = z.object({ phone: zUz.phone(), pinfl: zUz.pinfl(), tags: z.array(z.string()).max(5) });

const form = useForm({ resolver: zodResolver(schema), defaultValues: { phone: '', pinfl: '', tags: [] } });

<Form form={form} onSubmit={save}>
  <FormField name="phone" label="Telefon" description="SMS kod yuboriladi">
    <PhoneInput />
  </FormField>
  <FormField name="tags" label="Teglar"><TagInput /></FormField>
  <FormRootError />
  <FormSubmit>Saqlash</FormSubmit>
</Form>
```

| Qism | Vazifa |
|---|---|
| `Form` | `<form>` + `FormProvider`; `onSubmit` → `handleSubmit`; `noValidate` |
| `FormField` | `Controller` + mavjud `Field`: `label`, `description`, xato (`fieldState.error.message`) avtomatik; bolaga `value` / `onValueChange` / `onBlur` / `name` / `ref` / `invalid` ni uzatadi. Komponent `onChange` (native input) yoki `onValueChange` (kutubxona) ishlatishini aniqlaydi — **ikkala API ham ishlaydi** (Input, Textarea, Select, Combobox, Checkbox, Switch, RadioGroup, Slider, SegmentedControl, DatePicker, MaskedInput oilasi, TagInput, Rating, ColorPicker, RegionSelect, OtpInput, FileUpload) |
| `FormSubmit` | `Button type="submit"`, `isSubmitting` da `loading` |
| `FormRootError` | `errors.root` uchun `Alert color="danger"` |
| `useFormField()` | maxsus komponentlar uchun: `{ value, onValueChange, invalid, error, id }` |

Har bir komponent uchun moslik jadvali docs'da (qaysi prop'lar uzatiladi); moslashmagan komponent bo'lsa — `FormField render={(field) => …}` zaxira yo'li.

### `@akhatmirzo/core/zod` (zod — ixtiyoriy peer, v4)

```ts
import { zUz } from '@akhatmirzo/core/zod';
zUz.phone()       // +998 raqam, natija — tozalangan "998901234567"
zUz.pinfl({ checksum?: boolean })
zUz.inn() · zUz.passport() · zUz.carPlate() · zUz.bankAccount() · zUz.mfo()
zUz.card()        // Luhn
zUz.email() · zUz.password({ minScore? = 2 })
zUz.money({ min?, max? })   // son yoki "1 250 000" matni → number
zUz.region()      // UZ_REGIONS id
```
Xato matnlari o'zbekcha (default), `messages` opsiyasi bilan o'zgartiriladi. Hammasi mavjud `isValidX` / `parseX` funksiyalariga tayanadi (takrorlanmaydi).

---

## B. Bloklar (docs) — tayyor bo'limlar

Docs'da yangi bo'lim **"Bloklar"** (`/docs/v0.3/blocks/...`): har blok — jonli ko'rinish (to'liq kenglik, desktop/mobil almashtirgich) + kod (nusxa olish) + CLI buyrug'i.

| Blok | Tarkib |
|---|---|
| `login` | email/telefon + parol, "Esda qolsin", Google tugmasi joyi, xato holati |
| `register` | ism, telefon (+998), parol kuchi, shartlar |
| `otp-verify` | OtpInput + `useCountdown` bilan qayta yuborish |
| `pricing` | 3 ta tarif kartochkasi, oylik/yillik SegmentedControl, so'mda narxlar |
| `dashboard-stats` | 4 ta KPI kartochka (Sparkline), AreaChart |
| `settings-profile` | avatar yuklash, ism, email, RegionSelect, saqlash — `@akhatmirzo/ui/form` + `zUz` bilan |
| `data-table-page` | sarlavha + filtrlar + DataTable + Pagination + EmptyState |
| `checkout-summary` | savat ro'yxati, promokod, jami (so'mda), Stepper |
| `app-shell-layout` | AppShell + Sidebar + Header to'liq qolip |

Qoidalar: har blok bitta fayl (`apps/docs/blocks/<name>/<name>.tsx`), faqat `@akhatmirzo/*` paketlari + `lucide-react`; matnlar o'zbekcha; mustaqil (o'z holati bilan).

---

## C. CLI — `@akhatmirzo/cli` (yangi paket)

```bash
npx @akhatmirzo/cli init              # paketlarni o'rnatadi, CSS ga tokens + @source qo'shadi
npx @akhatmirzo/cli add login pricing # bloklarni loyihaga ko'chiradi
npx @akhatmirzo/cli list              # mavjud bloklar
```

| Buyruq | Xatti-harakat |
|---|---|
| `init` | paket menejerini aniqlaydi (lockfile bo'yicha: pnpm / npm / yarn / bun); `@akhatmirzo/ui @akhatmirzo/tokens` ni o'rnatadi; global CSS faylini topadi (yoki so'raydi) va `@import '@akhatmirzo/tokens/theme.css'` + `@source` qatorini qo'shadi (takror qo'shmaydi); Tailwind v4 borligini tekshiradi |
| `add <block...>` | registry'dan JSON oladi, faylni `--dir` (default `components/blocks`) ga yozadi; fayl bor bo'lsa — so'raydi (`--overwrite`); blokka kerakli qo'shimcha paketlarni (`recharts`, `react-hook-form`, `zod` ...) o'rnatishni taklif qiladi |
| `list` | bloklar ro'yxati va tavsifi |
| umumiy | `--cwd`, `--yes`, `--registry <url>` (default `https://toolkit.akhatmirzo.uz/r`), `--help`, `--version` |

**Registry:** docs build paytida `apps/docs/public/r/index.json` va `r/<name>.json` (`{ name, title, description, dependencies, files: [{ path, content }] }`) — bloklar papkasidan generator skript bilan yaratiladi.
**Texnik:** Node ≥ 18, **bog'liqliksiz** (faqat `node:` modullari, `fetch`); bitta ESM fayl (`bin`); interaktiv savollar `node:readline`; testlar — vaqtinchalik papkada `init`/`add` (registry mock'lanadi).

---

## Bajarish

| Agent | Ish |
|---|---|
| A | §A — `ui/form` + `core/zod`, testlar, docs (`components/form`, `core/zod`), playground |
| B | §B — 9 ta blok, docs "Bloklar" bo'limi va ko'rinish komponenti |
| C | §C — `packages/cli` + registry generator (B bloklari tayyor bo'lmaguncha — namunaviy blok bilan), docs `cli` sahifasi |
| Nazoratchi | moslik (har komponent `FormField` bilan haqiqatda ishlaydimi — test), bundle (asosiy kirishlarda `react-hook-form`/`zod` yo'q), CLI xavfsizligi (fayllarni faqat loyiha papkasiga yozadi, path traversal yo'q), bloklar sifati |
