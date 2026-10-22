# 6-daraja: 2-guruh — murakkab komponentlar

> Holat: ✅ tasdiqlandi · Umumiy qoidalar: [00-conventions.md](00-conventions.md) · Animatsiya: [DESIGN.md §5](../DESIGN.md)
> Tarkib: **TagInput · Rating · ColorPicker · ContextMenu · HoverCard · Charts · AppShell + Sidebar**
> Reja: `@akhatmirzo/ui@0.4.0` (minor) — mavjud API buzilmaydi.
> `DateRangePicker` va `Calendar` allaqachon bor (`date-picker`) — bu guruhdan chiqarildi.

---

## Umumiy

- Hammasi [00-conventions.md](00-conventions.md) ga bo'ysunadi (`className`, `ref`, `...props`, `data-*`, `labels` — o'zbekcha default, faqat semantik tokenlar).
- Yangi bog'liqliklar: `@radix-ui/react-context-menu`, `@radix-ui/react-hover-card`; grafiklar uchun `recharts` — **ixtiyoriy** peer (faqat `@akhatmirzo/ui/charts` ishlatilsa kerak).
- Har bir komponent: testlar · docs (uz + en) · playground · `index.ts` eksporti.

| Komponent | Asos | Guruh |
|---|---|---|
| TagInput | o'zimizniki (+ Badge) | Formalar |
| Rating | o'zimizniki | Tanlov |
| ColorPicker | o'zimizniki (+ Popover) | Formalar |
| ContextMenu | Radix ContextMenu | Overlay |
| HoverCard | Radix HoverCard | Overlay |
| Charts | Recharts (`@akhatmirzo/ui/charts`) | Ma'lumotlar |
| AppShell, Sidebar | o'zimizniki (+ Drawer) | Layout (yangi guruh) |

---

## TagInput

Teglar / kalit so'zlar / email ro'yxatini kiritish.

```tsx
<Field label="Teglar" description="Enter yoki vergul bilan qo'shing">
  <TagInput value={tags} onValueChange={setTags} placeholder="Teg qo'shing" />
</Field>
<TagInput suggestions={['React', 'Next.js', 'Tailwind']} maxTags={5} />
<TagInput validate={isValidEmail} placeholder="Email qo'shing" />
```

| Prop | Tip | Default |
|---|---|---|
| `value` / `defaultValue` / `onValueChange` | `string[]` | `[]` |
| `delimiters` | `string[]` | `['Enter', ',']` — `Tab` ixtiyoriy |
| `maxTags` | `number` | — (yetganda input yashiriladi, `data-full`) |
| `allowDuplicates` | `boolean` | `false` (katta-kichik harf farqsiz) |
| `validate` | `(tag) => boolean \| string` | — `false`/matn → teg qo'shilmaydi, xato `Field`'ga |
| `transform` | `(raw) => string` | `trim` |
| `suggestions` | `string[]` | — berilsa yozishda ro'yxat (`normalizeUz` bilan qidiruv, kirill/lotin farqsiz) |
| `size`, `disabled`, `invalid`, `name` | — | `name` → yashirin input'lar (`name[]`) |
| `labels` | `{ remove: (tag) => string; suggestions; added; removed }` | `"${tag} ni olib tashlash"`, ... |

**Xatti-harakat:** `Backspace` bo'sh inputda — oxirgi teg tanlanadi, ikkinchi bosish o'chiradi; `←/→` teglar orasida yurish; paste `"a, b, c"` → 3 teg; teg ustiga ikki bosish — tahrirlash.
**Dizayn:** Input bilan bir xil konteyner (balandlik `size` bo'yicha minimal, teglar ko'paysa o'sadi), teglar — `Badge soft` + ✕, oraliq 4px.
**A11y:** teglar ro'yxati `role="list"`; qo'shish/o'chirish `aria-live="polite"` orqali e'lon qilinadi.

---

## Rating

```tsx
<Rating defaultValue={4} />
<Rating value={v} onValueChange={setV} allowHalf size="lg" />
<Rating value={4.5} readOnly />                      {/* sharhlar ro'yxatida */}
```

| Prop | Tip | Default |
|---|---|---|
| `value` / `defaultValue` / `onValueChange` | `number` | `0` |
| `max` | `number` | `5` |
| `allowHalf` | `boolean` | `false` |
| `allowClear` | `boolean` | `true` — tanlangan qiymatni qayta bosish `0` qiladi |
| `readOnly`, `disabled` | `boolean` | — |
| `size` | `sm \| md \| lg` | `md` — 16 / 20 / 28px |
| `icon` | `ReactNode` | ichki yulduz SVG |
| `color` | `warning \| primary \| danger` | `warning` |
| `labels` | `{ value: (v, max) => string; group }` | `"${v} / ${max}"`, `"Baho"` |

**A11y:** interaktiv — `role="radiogroup"` + har yulduz `role="radio"` (strelkalar, Home/End); `readOnly` — `role="img"` + `aria-label="4.5 / 5"`.
**Dizayn:** to'lgan — `text-{color}`, bo'sh — `text-text-muted` (kontrast ≥ 3:1); hover'da oldindan ko'rish; yarim — `clip-path`.

---

## ColorPicker

```tsx
<ColorPicker value={color} onValueChange={setColor} />
<ColorPicker swatches={['#4f46e5', '#0ea5e9', '#10b981']} />
```

| Prop | Tip | Default |
|---|---|---|
| `value` / `defaultValue` / `onValueChange` | `string` (`#rrggbb`) | `#4f46e5` |
| `swatches` | `string[]` | kutubxona palitrasidan 10 ta |
| `alpha` | `boolean` | `false` — `true` → `#rrggbbaa` + shaffoflik slayderi |
| `eyeDropper` | `boolean` | `true` — brauzer `EyeDropper` API'si bo'lsa tugma chiqadi |
| `size`, `disabled`, `invalid`, `name` | — | — |
| `labels` | `{ trigger, saturation, hue, alpha, hex, eyeDropper, swatches }` | o'zbekcha |

**Tuzilma:** trigger — Input ko'rinishida (chapda rang namunasi + hex matn); Popover ichida: to'yinganlik maydoni (2D), hue slayderi, (alpha), hex input, swatch'lar.
**A11y:** 2D maydon — `role="slider"` ikki o'q uchun strelkalar (`aria-valuetext="to'yinganlik 80%, yorqinlik 60%"`); hue/alpha — `Slider` komponenti.
**Rang hisoblari** (`hex ↔ hsv`) — `@akhatmirzo/core` ga emas, komponent ichida (`color-utils.ts`), testlar bilan.

---

## ContextMenu

**Asos:** `@radix-ui/react-context-menu`. API va ko'rinish **DropdownMenu bilan bir xil** (stillar umumiy modulga chiqariladi, takrorlanmaydi).

```tsx
<ContextMenu>
  <ContextMenu.Trigger asChild><Card>…fayl…</Card></ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item icon={<Edit />} shortcut={['mod', 'E']}>Tahrirlash</ContextMenu.Item>
    <ContextMenu.Separator />
    <ContextMenu.Item variant="danger">O'chirish</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu>
```
Qismlar: `Trigger`, `Content`, `Item`, `CheckboxItem`, `RadioGroup`, `RadioItem`, `Label`, `Separator`, `Sub`, `SubTrigger`, `SubContent`.
**Mobil:** uzoq bosish (Radix) — docs'da eslatma: muhim amallar boshqa yo'l bilan ham mavjud bo'lsin.

---

## HoverCard

**Asos:** `@radix-ui/react-hover-card`

```tsx
<HoverCard openDelay={400}>
  <HoverCard.Trigger asChild><a href="/u/akhatmirzo">@akhatmirzo</a></HoverCard.Trigger>
  <HoverCard.Content side="bottom" align="start">…profil…</HoverCard.Content>
</HoverCard>
```
| Prop | Default |
|---|---|
| `openDelay` / `closeDelay` | `500` / `200` ms |
| `Content`: `side`, `align`, `sideOffset` | `bottom`, `center`, `6` |
| `Content`: `size` | `sm \| md` — 240 / 320px |

**Dizayn:** Popover bilan bir xil panel. **A11y:** faqat qo'shimcha ma'lumot uchun — trigger o'zi havola/tugma bo'lishi va ma'lumot boshqa joyda ham bo'lishi kerak (docs'da ogohlantirish); touch qurilmalarda ochilmaydi.

---

## Charts — `@akhatmirzo/ui/charts`

Alohida kirish nuqtasi: asosiy `@akhatmirzo/ui` importi `recharts` ni tortmaydi. `recharts` — ixtiyoriy `peerDependency` (`peerDependenciesMeta.optional`).

**Ikki daraja:**

1) **Tayyor grafiklar** (ko'p holat uchun yetarli):
```tsx
import { AreaChart, BarChart, LineChart, DonutChart, Sparkline } from '@akhatmirzo/ui/charts';

<AreaChart
  data={sales}                       // [{ month: 'Yan', tushum: 120, xarajat: 80 }, ...]
  index="month"
  series={[{ key: 'tushum', label: 'Tushum' }, { key: 'xarajat', label: 'Xarajat' }]}
  valueFormat={(v) => formatMoney(v)}
  height={280}
/>
<DonutChart data={byCategory} index="name" value="total" centerLabel="Jami" />
<Sparkline data={[3, 5, 4, 8, 6]} color="success" />
```

| Prop (umumiy) | Tip | Default |
|---|---|---|
| `data`, `index` | `T[]`, `keyof T` | — |
| `series` | `{ key; label?; color? }[]` | ranglar ketma-ket token palitrasidan |
| `valueFormat`, `indexFormat` | `(v) => string` | `formatNumber` |
| `height` | `number` | `280` |
| `legend`, `grid`, `tooltip` | `boolean` | `true` |
| `stacked` (Area/Bar) | `boolean` | `false` |
| `orientation` (Bar) | `vertical \| horizontal` | `vertical` — tik ustunlar (Recharts'dagi `layout` teskari ma'noda, shuning uchun boshqa nom) |
| `curve` (Area/Line) | `monotone \| linear \| step` | `monotone` |
| `emptyState` | `ReactNode` | ma'lumot bo'sh bo'lsa — `EmptyState` (`"Ma'lumot yo'q"`) |
| `loading` | `boolean` | Skeleton |

2) **Primitivlar** (o'z grafigingizni Recharts bilan yig'ish uchun): `ChartContainer` (responsiv, `config` → CSS o'zgaruvchilar), `ChartTooltip`, `ChartLegend`, `chartColors`, `axisProps`, `gridProps`.

**Dizayn:** ranglar faqat tokenlar (`var(--ak-*)`) — dark rejimda o'zi moslashadi; tooltip — `surface-raised`, `shadow-lg`, radius `xl`; o'qlar `text-muted` 12px, to'r chiziqlari `border` punktir.
**A11y:** har grafik `role="figure"` (ichida klaviatura qatlami bor; Sparkline — `role="img"`) + `aria-label` (majburiy prop `title` yoki `aria-label`), ixtiyoriy `description`; `accessibilityLayer` (Recharts klaviatura) yoqilgan; docs'da "jadval ko'rinishi"ni ham berish tavsiyasi.
**Asos:** docs'dagi `components/examples/shared/chart.tsx` — kutubxonaga ko'chiriladi va namunalar yangi importga o'tkaziladi.

---

## AppShell + Sidebar

Admin panel / dashboard qolipi (docs'dagi admin namunasi asosida).

```tsx
<AppShell sidebarStorageKey="sidebar">
  <Sidebar>
    <Sidebar.Header><Logo /></Sidebar.Header>
    <Sidebar.Content>
      <Sidebar.Group label="Asosiy">
        <Sidebar.Item icon={<Home />} href="/" active>Bosh sahifa</Sidebar.Item>
        <Sidebar.Item icon={<Box />} href="/orders" badge={12}>Buyurtmalar</Sidebar.Item>
      </Sidebar.Group>
    </Sidebar.Content>
    <Sidebar.Footer><UserMenu /></Sidebar.Footer>
  </Sidebar>
  <AppShell.Main>
    <AppShell.Header><AppShell.SidebarToggle /><Breadcrumb items={…} /></AppShell.Header>
    {children}
  </AppShell.Main>
</AppShell>
```

| Qism | Props |
|---|---|
| `AppShell` | `sidebarOpen` / `defaultSidebarOpen` / `onSidebarOpenChange` (desktop: yig'ilgan ↔ to'liq), `sidebarStorageKey` (SSR-xavfsiz), `shortcut` — default `mod+B` |
| `Sidebar` | `width` — 256px, yig'ilganda 64px (faqat ikonkalar + Tooltip); `< 1024px` da — `Drawer` (chapdan), sahifa o'tishida yopiladi |
| `Sidebar.Item` | `icon`, `href` / `onClick`, `active`, `badge`, `renderLink` (Next `Link`), `disabled` |
| `Sidebar.Group` | `label`, `collapsible?` (Accordion uslubida) |
| `AppShell.Header` | yopishqoq (`sticky top-0`), balandlik 56px, pastki chegara |
| `AppShell.SidebarToggle` | IconButton, `aria-expanded`, `aria-controls` |
| `useAppShell()` | `{ sidebarOpen, setSidebarOpen, mobileOpen, setMobileOpen, collapsed }` |

**A11y:** `<nav aria-label="Asosiy menyu">`, faol element `aria-current="page"`; yig'ilgan holatda har Item'da Tooltip + `aria-label`; "Asosiy kontentga o'tish" (skip link) — `AppShell` o'zi qo'yadi.
**Dizayn:** sidebar `bg-surface` + o'ng chegara; faol item `bg-primary-soft text-primary-soft-foreground`; yig'ilish animatsiyasi `width` emas — `grid-template-columns` / transform (DESIGN §5), reduced-motion'da sakrab.

---

## Bajarish tartibi

| Agent | Komponentlar |
|---|---|
| A | TagInput, Rating, ColorPicker |
| B | ContextMenu, HoverCard, AppShell + Sidebar |
| C | Charts (`@akhatmirzo/ui/charts`) + docs namunalarini yangi importga o'tkazish |
| Nazoratchi | spetsifikatsiya, qoidalar, a11y, dark mode, bundle (asosiy kirish `recharts` siz) |

Umumiy fayllar (`package.json`, lockfile, `tsup` kirishlari, `index.ts`, docs menyusi, changeset) — ishdan oldin men tayyorlayman.
**Tayyor mezoni:** komponent + testlar · docs uz + en · playground · typecheck, lint, format, test, build · lockfile faqat rejalashtirilgan o'zgarishlar.
