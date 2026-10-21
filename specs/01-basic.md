# 1-daraja: asosiy komponentlar

> Holat: ✅ tasdiqlandi · Prototip: [../prototype/tier1.html](../prototype/tier1.html) · Umumiy qoidalar: [00-conventions.md](00-conventions.md)
> Barchasi **0 dan** (native HTML elementlar ustiga), tashqi bog'liqliksiz.

---

## Button

**Vazifasi:** harakatni ishga tushirish. Navigatsiya uchun `asChild` + `<a>`.

| Prop | Tip | Default |
|---|---|---|
| `variant` | `primary \| soft \| outline \| ghost \| danger \| link` | `soft` |
| `size` | `sm \| md \| lg` | `md` |
| `loading` | `boolean` | `false` |
| `leftIcon`, `rightIcon` | `ReactNode` | — |
| `fullWidth` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |

**Holatlar:**
- `hover` — fon bir pog'ona to'qroq (150ms)
- `active` — `scale(0.97)` (100ms)
- `loading` — matn joyida qoladi (kenglik o'zgarmaydi), ustida spinner; bosish o'chadi; `aria-busy="true"`
- `disabled` — 50% shaffof

**Klaviatura:** `Enter` / `Space` — bosish.

**`link` varianti** — matn ko'rinishidagi tugma: fon va padding yo'q, `primary` rang, hover'da tagiga chiziq. Havola uchun `asChild` bilan: `<Button variant="link" asChild><a href="/shartlar">Shartlar</a></Button>`. Alohida `Link` komponenti yo'q.

**`IconButton`** — alohida komponent: kvadrat (32/40/48), `aria-label` **majburiy**.

```tsx
<Button variant="primary" leftIcon={<Plus />}>Qo'shish</Button>
<Button loading>Saqlanmoqda</Button>
<IconButton aria-label="Yopish" variant="ghost"><X /></IconButton>
```

---

## Input

| Prop | Tip | Default |
|---|---|---|
| `size` | `sm \| md \| lg` | `md` |
| `invalid` | `boolean` | `false` (Field ichida avtomatik) |
| `leftIcon`, `rightIcon` | `ReactNode` | — |
| `prefix`, `suffix` | `ReactNode` | — (masalan `+998`, `so'm`) |
| `clearable` | `boolean` | `false` — qiymat bo'lsa ✕ tugmasi |
| `onClear` | `() => void` | — |

`type="password"` bo'lsa — avtomatik **ko'rsatish/yashirish** (👁) tugmasi.

**Holatlar:**
- `default` — `surface` fon, `border` chegara
- `hover` — `border-strong`
- `focus` — chegara `primary` + `ring` halqasi
- `invalid` — chegara `danger`, focus'da ham qizil halqa
- `disabled` — `surface-muted` fon
- `readOnly` — oddiy ko'rinish, lekin fon `surface-muted`

**Klaviatura:** `Esc` — `clearable` bo'lsa tozalaydi.

---

## Textarea

Input'ning barcha holatlari + qo'shimcha:

| Prop | Tip | Default |
|---|---|---|
| `autoResize` | `boolean` | `false` — matnga qarab o'sadi |
| `minRows`, `maxRows` | `number` | `3`, — |
| `showCount` | `boolean` | `false` — `maxLength` bilan "120 / 500" |

---

## Field + Label

```tsx
<Field label="Email" required description="Faqat tasdiqlash uchun" error="Email noto'g'ri">
  <Input />
</Field>
```

| Prop | Tip |
|---|---|
| `label` | `ReactNode` |
| `description` | `ReactNode` — label ostida, `text-muted` |
| `error` | `ReactNode` — bo'lsa input `invalid`, matn `danger` + ikonka |
| `required` | `boolean` — label yonida `*` |
| `orientation` | `vertical \| horizontal` |

Avtomatik: `id`, `htmlFor`, `aria-describedby`, `aria-invalid`, `aria-required`.

---

## Checkbox

Native `<input type="checkbox">` ustida (accessibility tekin).

| Prop | Tip | Default |
|---|---|---|
| `checked` / `defaultChecked` | `boolean \| "indeterminate"` | — |
| `onCheckedChange` | `(v) => void` | — |
| `label`, `description` | `ReactNode` | — |
| `size` | `sm \| md` | `md` (16 / 20px) |

- Radius `sm` (6px), belgilanganda `primary` fon + oq ✓ (chizilish animatsiyasi 150ms)
- `indeterminate` — "−" belgi ("hammasini tanlash" uchun)
- Label bosilsa ham belgilanadi

**Klaviatura:** `Space`.

---

## RadioGroup + Radio

```tsx
<RadioGroup value={v} onValueChange={setV} orientation="vertical">
  <Radio value="click" label="Click" />
  <Radio value="payme" label="Payme" />
</RadioGroup>
```

- Doira, tanlanganda ichida `primary` nuqta (scale 0→1, spring)
- **Klaviatura:** `↑↓ / ←→` — guruh ichida yurish va tanlash; `Tab` — guruhga kirish/chiqish
- **Variant `card`:** har bir variant katta bosiladigan karta ko'rinishida (to'lov usulini tanlash kabi)

---

## Switch

| Prop | Tip | Default |
|---|---|---|
| `checked` / `defaultChecked` | `boolean` | — |
| `onCheckedChange` | `(v) => void` | — |
| `label`, `description` | `ReactNode` | — |
| `size` | `sm \| md` | `md` |

- `role="switch"`, radius `full`
- Tugmacha siljishi 150ms **spring**; yoqilganda `primary` fon
- Darhol ta'sir qiladigan sozlamalar uchun (Checkbox — "saqlash" tugmasi bilan formalar uchun)

---

## Badge

| Prop | Tip | Default |
|---|---|---|
| `color` | `neutral \| primary \| success \| warning \| danger \| info` | `neutral` |
| `variant` | `soft \| solid \| outline` | `soft` |
| `size` | `sm \| md` | `md` |
| `dot` | `boolean` | `false` — chap tomonda rangli nuqta |
| `onRemove` | `() => void` | — bo'lsa ✕ (filtr teglari uchun) |

Radius `full`, matn `text-xs` 500.

---

## Avatar

| Prop | Tip | Default |
|---|---|---|
| `src`, `alt` | `string` | — |
| `name` | `string` | — rasm yo'q bo'lsa bosh harflar ("Sarvar Abduxoliqov" → "SA") |
| `size` | `xs \| sm \| md \| lg \| xl` | `md` (24/32/40/48/64) |
| `shape` | `circle \| square` | `circle` |
| `status` | `online \| offline \| busy` | — burchakda nuqta |

- Bosh harflar foni — ismdan **deterministik** rang (bir ism doim bir rang)
- Rasm yuklanmasa — avtomatik bosh harflarga o'tadi
- **`AvatarGroup`** — ustma-ust, `max={3}` → "+5"

---

## Card

Kompozitsiya:
```tsx
<Card>
  <Card.Header title="Buyurtma #1042" description="Bugun, 14:20" action={<Badge>Yangi</Badge>} />
  <Card.Body>...</Card.Body>
  <Card.Footer>...</Card.Footer>
</Card>
```

| Prop | Tip | Default |
|---|---|---|
| `variant` | `elevated \| outline \| soft` | `elevated` (shadow-sm + border) |
| `padding` | `none \| sm \| md \| lg` | `md` (24px) |
| `interactive` | `boolean` | `false` — hover'da soya `md` ga ko'tariladi, kursor pointer |

---

## Spinner

| Prop | Tip | Default |
|---|---|---|
| `size` | `sm \| md \| lg` | `md` (16/20/24) |
| `label` | `string` | `"Yuklanmoqda"` (faqat ekran o'quvchi uchun) |

`role="status"`, `currentColor` rangida, 700ms `linear` aylanish.

---

## Skeleton

```tsx
<Skeleton className="h-4 w-32" />
<Skeleton variant="circle" className="size-10" />
<Skeleton.Text lines={3} />
```

- Fon `surface-muted`, shimmer 1.5s (reduced-motion'da — oddiy pulsatsiya)
- `aria-hidden`, ota elementda `aria-busy`
- `Skeleton.Text` — oxirgi qator 60% kenglikda (tabiiy ko'rinish)

---

## Divider

| Prop | Tip | Default |
|---|---|---|
| `orientation` | `horizontal \| vertical` | `horizontal` |
| `label` | `ReactNode` | — o'rtada matn ("yoki") |

`border` rangida, 1px.

---

## Kbd

Klaviatura tugmasini ko'rsatish: `Ctrl+K`, `Esc`, `↵`.

```tsx
<Kbd>Esc</Kbd>
<Kbd keys={["mod", "K"]} />   // Windows'da "Ctrl K", macOS'da "⌘ K"
```

| Prop | Tip | Default |
|---|---|---|
| `keys` | `string[]` | — `mod` — OS'ga qarab `Ctrl` / `⌘` |
| `size` | `sm \| md` | `sm` |

- `<kbd>` elementi, `font-mono` `text-xs`, `surface-muted` fon, 1px `border` + pastki chegara 2px (tugma "bo'rtib" turadi), radius `sm`
- Tooltip, Dropdown Menu va Command Palette ichida qisqa yo'llarni ko'rsatish uchun

---

## Qarorlar (hal qilingan savollar)

- [x] `Button` default varianti — **`soft`**. `primary` — faqat ongli tanlov bilan, sahifadagi asosiy harakat uchun
- [x] `Link` — alohida komponent yo'q, **`Button variant="link"`** + `asChild`
- [x] `Kbd` — **1-darajaga qo'shildi** (Command Palette va menyulardagi qisqa yo'llar uchun)
