# 4-daraja: kengaytirilgan to'plam (1-guruh)

> Holat: ✅ tasdiqlandi · Umumiy qoidalar: [00-conventions.md](00-conventions.md) · Animatsiya: [DESIGN.md §5](../DESIGN.md)
> Tarkib: **Alert · Progress · Slider · Pagination · Breadcrumb · Stepper · SegmentedControl · EmptyState**
> Reja: `@akhatmirzo/ui@0.2.0` (minor) — mavjud API buzilmaydi.

---

## Umumiy

- Hammasi [00-conventions.md](00-conventions.md) ga bo'ysunadi: `className`, `ref`, `...props`, `data-*` holatlar, `focus-ring`, `labels` prop (default — o'zbek lotin).
- Ranglar faqat tokenlar orqali (`bg-primary-soft`, `text-text-muted`, ...) — qattiq rang yo'q.
- Animatsiyalar `prefers-reduced-motion` da o'chadi yoki opacity'ga almashadi.
- Yangi bog'liqliklar (faqat zarur joyda): `@radix-ui/react-slider`, `@radix-ui/react-radio-group`.
- Har bir komponent uchun: testlar (Vitest + Testing Library + axe), docs sahifasi (uz + en), playground namunasi, `index.ts` eksporti.

| Komponent | Asos | Guruh (`index.ts`) |
|---|---|---|
| Alert | o'zimizniki | Ko'rsatish |
| Progress, ProgressCircle | o'zimizniki | Ko'rsatish |
| EmptyState | o'zimizniki | Ko'rsatish |
| Slider | Radix Slider | Tanlov |
| SegmentedControl | Radix RadioGroup | Tanlov |
| Pagination | `getPagination` (`@akhatmirzo/hooks`) | Navigatsiya |
| Breadcrumb | o'zimizniki (+ DropdownMenu) | Navigatsiya |
| Stepper | o'zimizniki | Navigatsiya |

---

## Alert

Sahifa ichidagi doimiy xabar (Toast'dan farqi — o'zi yo'qolmaydi, kontent oqimida turadi).

```tsx
<Alert color="warning" title="Obuna 3 kundan keyin tugaydi">
  To'lovni hozir qilsangiz, ma'lumotlaringiz saqlanib qoladi.
</Alert>

<Alert color="danger" title="To'lov o'tmadi" action={<Button size="sm">Qayta urinish</Button>} onClose={hide} />
```

| Prop | Tip | Default |
|---|---|---|
| `color` | `neutral \| primary \| success \| warning \| danger \| info` | `info` |
| `variant` | `soft \| outline \| solid` | `soft` |
| `title` | `ReactNode` | — |
| `icon` | `ReactNode \| false` | rangga mos ichki SVG (info ⓘ, success ✓, warning △, danger ⊗, neutral/primary — ⓘ) |
| `action` | `ReactNode` | — (o'ngda; tor ekranda matn ostiga tushadi) |
| `onClose` | `() => void` | berilsa ✕ tugmasi chiqadi |
| `banner` | `boolean` | `false` — sahifa tepasi uchun: radius 0, faqat pastki chegara, kontent markazda |
| `labels` | `{ close?: string }` | `"Yopish"` |

**Dizayn:** radius `lg` (12px), padding `12px 16px`, ikonka 18px (title qatori bilan tekis), gap 12px. Title `text-sm font-semibold`, matn `text-sm`; `soft` — `bg-{color}-soft text-{color}-soft-foreground`, `outline` — `border-{color}` + `bg-surface`, `solid` — `bg-{color} text-{color}-foreground`.
**A11y:** `danger` va `warning` → `role="alert"`, qolganlari → `role="status"`. Rang yagona signal emas — ikonka + title.
**Animatsiya:** yo'q (yopilishini ilova boshqaradi).

---

## Progress va ProgressCircle

```tsx
<Progress value={64} label="Yuklanmoqda" showValue />
<Progress value={null} />                       {/* noaniq (indeterminate) */}
<ProgressCircle value={72} size="lg" showValue />
```

| Prop | Tip | Default |
|---|---|---|
| `value` | `number \| null` | `null` → noaniq holat |
| `max` | `number` | `100` |
| `color` | `primary \| success \| warning \| danger` | `primary` |
| `size` | `sm \| md \| lg` | `md` — chiziq: 4 / 8 / 12px; doira: 24 / 40 / 64px (chiziq qalinligi 3 / 4 / 6px) |
| `label` | `ReactNode` | — (chiziq ustida chapda; doirada — ko'rinmas `aria-label`) |
| `showValue` | `boolean` | `false` — `%` (chiziqda o'ngda, doirada markazda; `sm` doirada ko'rsatilmaydi) |
| `formatValue` | `(value, max) => string` | `"64%"` |

**Dizayn:** trek `bg-surface-muted`, to'liq radius; to'lgan qism `bg-{color}`.
**A11y:** `role="progressbar"`, `aria-valuemin/max/now`, `aria-valuetext` = `formatValue` natijasi; noaniqda `aria-valuenow` yo'q, `data-state="indeterminate"`, aks holda `loading` / `complete`.
**Animatsiya:** kenglik / `stroke-dashoffset` o'zgarishi 300ms `ease-out`. Noaniq: chiziqda 40% bo'lak chapdan o'ngga 1.4s cheksiz; doirada aylanish 1s. Reduced-motion: noaniqda opacity pulsatsiyasi.

---

## EmptyState

Bo'sh ro'yxat, natijasiz qidiruv, birinchi kirish holati.

```tsx
<EmptyState
  icon={<Inbox />}
  title="Buyurtmalar hali yo'q"
  description="Birinchi buyurtma kelganda shu yerda ko'rinadi."
  action={<Button variant="primary">Mahsulot qo'shish</Button>}
  secondaryAction={<Button variant="ghost">Qo'llanma</Button>}
/>
```

| Prop | Tip | Default |
|---|---|---|
| `icon` | `ReactNode` | — (berilsa 48px doira ichida, `bg-surface-muted text-text-muted`; `lg` da 64px) |
| `title` | `ReactNode` | **majburiy** |
| `description` | `ReactNode` | — |
| `action`, `secondaryAction` | `ReactNode` | — (yonma-yon, tor ekranda ustma-ust, to'liq kenglik) |
| `size` | `sm \| md \| lg` | `md` — vertikal padding 24 / 40 / 64px |
| `bordered` | `boolean` | `false` — `border-dashed border-border rounded-xl` (bo'lim ichida ishlatish uchun) |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `3` — title `h*` tegi |

**Dizayn:** markazlangan; title `text-base font-semibold` (`lg` da `text-lg`), description `text-sm text-text-muted`, `max-w-[40ch]`; bo'laklar orasi 8px, tugmalar ustidan 20px.
**DataTable bilan:** DataTable'ning `empty` slotiga to'g'ridan-to'g'ri qo'yiladi — docs'da namunasi bo'ladi.

---

## Slider

**Asos:** `@radix-ui/react-slider`

```tsx
<Slider defaultValue={[40]} />
<Slider value={price} onValueChange={setPrice} min={0} max={5_000_000} step={50_000}
        formatValue={(v) => formatCurrency(v)} />          {/* [min, max] — oraliq */}
<Field label="Ovoz balandligi"><Slider defaultValue={[70]} /></Field>
```

Qiymat **doim massiv** (Radix kabi): bitta tutqich — `[50]`, oraliq — `[20, 80]`. Tutqichlar soni massiv uzunligidan olinadi.

| Prop | Tip | Default |
|---|---|---|
| `value` / `defaultValue` / `onValueChange` | `number[]` | — |
| `onValueCommit` | `(value: number[]) => void` | — (sudrash tugaganda; API so'rovlari uchun) |
| `min` / `max` / `step` | `number` | `0` / `100` / `1` |
| `minStepsBetweenThumbs` | `number` | `0` |
| `orientation` | `horizontal \| vertical` | `horizontal` |
| `size` | `sm \| md` | `md` — trek 4 / 6px, tutqich 16 / 20px |
| `showValue` | `never \| active \| always` | `active` — tutqich ustida qiymat pufakchasi (hover / sudrash / fokusda) |
| `formatValue` | `(v: number) => string` | `String(v)` |
| `marks` | `{ value: number; label?: ReactNode }[]` | — (trek ostida belgi + yozuv) |
| `disabled`, `invalid`, `name` | — | `name` berilsa har tutqich uchun yashirin input (forma yuborish) |
| `labels` | `{ thumb?: (index, count) => string }` | bitta: `"Qiymat"`, oraliq: `"Minimal qiymat"` / `"Maksimal qiymat"` |

**Dizayn:** trek `bg-surface-muted`, to'lgan qism `bg-primary`, tutqich `bg-surface` + `border-2 border-primary` + soya `sm`; hover'da tutqich atrofida `primary/15` halqa 6px; pufakcha — Tooltip uslubida (`bg-text text-surface text-xs`, radius `md`).
**A11y:** Radix (strelkalar ±step, PageUp/Down ±10×step, Home/End); `Field` ichida `aria-labelledby` avtomatik; `aria-valuetext` = `formatValue`.
**Touch:** tutqichning bosish maydoni ≥ 40px.

---

## SegmentedControl

**Asos:** `@radix-ui/react-radio-group` (semantikasi radio: bitta tanlov, strelkalar bilan yurish)

```tsx
<SegmentedControl defaultValue="month" aria-label="Davr">
  <SegmentedControl.Item value="day">Kun</SegmentedControl.Item>
  <SegmentedControl.Item value="week">Hafta</SegmentedControl.Item>
  <SegmentedControl.Item value="month">Oy</SegmentedControl.Item>
</SegmentedControl>
```

| Prop | Tip | Default |
|---|---|---|
| `value` / `defaultValue` / `onValueChange` | `string` | — (tanlovni bekor qilib bo'lmaydi) |
| `size` | `sm \| md \| lg` | `md` — balandlik 32 / 40 / 48px (Button bilan bir qatorda tekis) |
| `fullWidth` | `boolean` | `false` — elementlar teng bo'linadi |
| `disabled` | `boolean` | — |
| `Item.icon` | `ReactNode` | — (faqat ikonka bo'lsa `aria-label` majburiy) |
| `Item.disabled` | `boolean` | — |

**Dizayn:** trek `bg-surface-muted`, radius `lg`, padding 4px; tanlangan element `bg-surface text-text` + soya `sm`, qolganlari `text-text-muted`, hover'da `text-text`. Tanlangan fon — **bitta suriluvchi indikator** (`transform` + `width`, 200ms `ease-out`); reduced-motion'da sakrab o'tadi.
**Tabs'dan farqi:** Tabs — kontent panellarini almashtiradi; SegmentedControl — qiymat tanlaydi (filtr, ko'rinish rejimi). Docs'da shu farq yoziladi.

---

## Pagination

**Asos:** `getPagination` (`@akhatmirzo/hooks`) — hisob bitta joyda.

```tsx
<Pagination page={page} onPageChange={setPage} total={230} pageSize={10} />
<Pagination page={page} total={230} pageSize={10} getHref={(p) => `/blog?page=${p}`} />   {/* SEO: haqiqiy havolalar */}
```

| Prop | Tip | Default |
|---|---|---|
| `page` / `defaultPage` / `onPageChange` | `number` | `defaultPage = 1` |
| `total`, `pageSize` | `number` | — (yoki `pageCount` to'g'ridan-to'g'ri) |
| `pageCount` | `number` | `total / pageSize` dan |
| `siblings` | `number` | `1` |
| `getHref` | `(page) => string` | — berilsa tugmalar `<a href>` bo'ladi |
| `renderLink` | `(props & { page }) => ReactNode` | — (Next `Link` uchun; `getHref` bilan) |
| `size` | `sm \| md` | `md` — tugma 32 / 40px kvadrat |
| `showFirstLast` | `boolean` | `false` — ⏮ ⏭ tugmalari |
| `compact` | `boolean \| 'auto'` | `'auto'` — `< 640px` da `‹  3 / 24  ›` ko'rinishi |
| `labels` | `{ nav, previous, next, first, last, page: (n) => string, ellipsis }` | `"Sahifalash"`, `"Oldingi sahifa"`, `"Keyingi sahifa"`, ... `"${n}-sahifa"` |

**Dizayn:** tugmalar `ghost` uslubida, radius `md`, `text-sm tabular-nums`; joriy sahifa — `bg-primary text-primary-foreground`; ko'p nuqta `…` bosilmaydi; oldingi/keyingi — chevron ikonkalar, chekkada `disabled`.
**A11y:** `<nav aria-label>`, ichida `<ul>`; joriy sahifada `aria-current="page"`; har tugmada `aria-label="5-sahifa"`.
**Qo'shimcha:** `PaginationInfo` — `"21–30 / 230 ta"` matni (`from`, `to`, `total` hookdan), `labels.template` bilan.

---

## Breadcrumb

```tsx
<Breadcrumb
  items={[
    { label: 'Bosh sahifa', href: '/', icon: <Home /> },
    { label: 'Mahsulotlar', href: '/products' },
    { label: 'Telefonlar', href: '/products/phones' },
    { label: 'iPhone 17' },                       // oxirgisi — joriy sahifa
  ]}
  maxItems={4}
/>
```

| Prop | Tip | Default |
|---|---|---|
| `items` | `{ label: ReactNode; href?: string; icon?: ReactNode; onClick? }[]` | **majburiy** |
| `separator` | `ReactNode` | ichki chevron `›` (yoki `"/"`) |
| `maxItems` | `number` | — oshsa: birinchi + `…` + oxirgi 2 ta; `…` bosilsa DropdownMenu'da yashiringanlar |
| `renderLink` | `(props: { href, children, className }) => ReactNode` | `<a>` — Next `Link` uchun |
| `size` | `sm \| md` | `md` — `text-sm`; `sm` — `text-xs` |
| `labels` | `{ nav?: string; more?: string }` | `"Sahifa yo'li"`, `"Yashirilgan sahifalar"` |

**Dizayn:** havolalar `text-text-muted hover:text-text`, joriy element `text-text font-medium`, separator `text-text-faint` 14px; uzun nomlar `truncate max-w-[20ch]` (joriy — `max-w-[32ch]`).
**A11y:** `<nav aria-label>` → `<ol>`; oxirgi elementda `aria-current="page"` (havola emas); separator `aria-hidden`.
**Mobil:** `< 640px` da `maxItems` avtomatik 2 ga tushadi (faqat ota + joriy).

---

## Stepper

Ko'p qadamli jarayon (ro'yxatdan o'tish, checkout, sozlash ustasi).

```tsx
<Stepper
  value={step}                                  // 0 dan boshlanadi
  onValueChange={setStep}
  steps={[
    { title: 'Savat' },
    { title: 'Yetkazib berish', description: 'Manzil va vaqt' },
    { title: "To'lov" },
    { title: 'Tasdiqlash', optional: true },
  ]}
/>
```

| Prop | Tip | Default |
|---|---|---|
| `steps` | `{ title: ReactNode; description?: ReactNode; icon?: ReactNode; optional?: boolean; status?: 'error' }[]` | **majburiy** |
| `value` / `defaultValue` | `number` | `0` |
| `onValueChange` | `(index) => void` | berilsa — o'tgan qadamlar bosiladigan bo'ladi |
| `allowFutureSteps` | `boolean` | `false` — `true` bo'lsa kelgusi qadamlarga ham o'tish mumkin |
| `orientation` | `horizontal \| vertical` | `horizontal` |
| `size` | `sm \| md` | `md` — doira 32 / 24px |
| `compact` | `boolean \| 'auto'` | `'auto'` — gorizontalda `< 640px`: `"2 / 4 · Yetkazib berish"` + Progress chizig'i |
| `labels` | `{ step: (i, n) => string; optional; completed; error }` | `"${i}-qadam, ${n} tadan"`, `"ixtiyoriy"`, `"bajarildi"`, `"xato"` |

**Holatlar** (`data-status`): `complete` (indeks < value) · `current` · `upcoming` · `error` (`status: 'error'`).
**Dizayn:**
| Holat | Doira | Matn |
|---|---|---|
| complete | `bg-primary text-primary-foreground` + ✓ | `text-text` |
| current | `border-2 border-primary text-primary` + raqam, atrofida `primary/15` halqa | `text-text font-semibold` |
| upcoming | `border border-border text-text-muted` + raqam | `text-text-muted` |
| error | `bg-danger text-danger-foreground` + ! | `text-danger` |

Ulovchi chiziq 2px: o'tgan qism `bg-primary`, qolgani `bg-border`; o'zgarish 300ms.
**A11y:** `<ol>`, joriy qadamda `aria-current="step"`; bosiladigan qadamlar `<button>`, qolganlari oddiy element; har qadamda ko'rinmas holat matni (`"bajarildi"`).

---

## Bajarish tartibi (agentlar uchun)

| Agent | Komponentlar | Sabab |
|---|---|---|
| A | Alert, Progress (+Circle), EmptyState | oddiy, Radix'siz, faqat ko'rsatish |
| B | Slider, SegmentedControl | Radix asosida, forma bilan integratsiya |
| C | Pagination, Breadcrumb, Stepper | navigatsiya, havolalar, mobil `compact` rejimlar |
| Nazoratchi | — | har agentning ishini spetsifikatsiya va 00-conventions bo'yicha tekshiradi |

**Har agent uchun "tayyor" mezoni:** komponent + testlar (holatlar, klaviatura, axe) · docs sahifasi uz + en (namuna, props jadvali, a11y bo'limi) · playground'da ko'rinadi · `pnpm typecheck`, `pnpm lint`, `pnpm test`, docs build o'tadi · changeset (`minor`).
