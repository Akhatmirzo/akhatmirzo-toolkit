# 2-daraja: interaktiv komponentlar

> Holat: ✅ tasdiqlandi · Prototip: [../prototype/tier2.html](../prototype/tier2.html) · Umumiy qoidalar: [00-conventions.md](00-conventions.md) · Animatsiya: [DESIGN.md §5](../DESIGN.md)
> Asos: **Radix UI** (behavior, fokus, ARIA) + o'z dizaynimiz. Foydalanuvchi Radix'ni ko'rmaydi.

---

## Umumiy: "suzuvchi" qatlamlar (overlay)

Dialog, Drawer, Dropdown, Select, Combobox, Tooltip, Popover, Toast — barchasi **portal** orqali `<body>` oxiriga chiziladi (ota elementning `overflow: hidden` i kesib qo'ymasligi uchun).

### Z-index qatlamlari (token)
| Token | Qiymat | Kim |
|---|---|---|
| `--z-dropdown` | 1000 | Dropdown, Select, Combobox, Popover |
| `--z-overlay` | 1100 | Dialog / Drawer foni |
| `--z-modal` | 1110 | Dialog, Drawer paneli |
| `--z-toast` | 1200 | Toast |
| `--z-tooltip` | 1300 | Tooltip (har doim eng ustida) |

### Joylashuv (Popover turidagilar)
- `side`: `top | right | bottom | left` (default `bottom`), `align`: `start | center | end`
- Trigger'dan **6px** oraliq
- Ekran chetiga yetsa — **avtomatik teskari tomonga o'tadi** (collision detection)
- Animatsiya `transform-origin` trigger tomonda

### Yopilish qoidalari
| Harakat | Dialog | Drawer | Dropdown / Select / Popover | Tooltip |
|---|---|---|---|---|
| `Esc` | ✅ | ✅ | ✅ | ✅ |
| Tashqariga bosish | ✅ (o'chirish mumkin) | ✅ | ✅ | — |
| Fokus tashqariga chiqsa | — (focus trap) | — (focus trap) | ✅ | ✅ |
| Yopilgach fokus | trigger'ga qaytadi | trigger'ga qaytadi | trigger'ga qaytadi | — |

### Scroll lock
Dialog va Drawer ochiq bo'lsa — sahifa scroll qilinmaydi (scrollbar yo'qolganda layout "sakramaydi").

---

## Dialog (Modal)

**Asos:** `@radix-ui/react-dialog`

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <Dialog.Trigger asChild><Button>Ochish</Button></Dialog.Trigger>
  <Dialog.Content title="Profilni tahrirlash" description="O'zgarishlar darhol saqlanadi" size="md">
    ...forma...
    <Dialog.Footer>
      <Dialog.Close asChild><Button>Bekor qilish</Button></Dialog.Close>
      <Button variant="primary">Saqlash</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog>
```

| Prop (`Content`) | Tip | Default |
|---|---|---|
| `title` | `ReactNode` | **majburiy** (ekran o'quvchi uchun; ko'rinmas qilish mumkin: `hideTitle`) |
| `description` | `ReactNode` | — |
| `size` | `sm \| md \| lg \| xl \| full` | `md` (400 / 520 / 640 / 800px / ekran) |
| `closeButton` | `boolean` | `true` — o'ng yuqorida ✕ |
| `dismissible` | `boolean` | `true` — `false` bo'lsa tashqariga bosish yopmaydi |
| `mobileSheet` | `boolean` | `true` — telefonda pastdan chiqadi |

**Dizayn:** fon `surface`, radius `2xl` (20px), soya `xl`, padding 24px; overlay `slate-900 / 40%`.
**Telefonda (< 640px):** pastdan chiqadigan sheet ko'rinishiga o'tadi (radius faqat yuqorida).
**Animatsiya:** overlay opacity + panel `scale(0.95→1)` 200ms / chiqish 150ms.

### `ConfirmDialog` — tez tasdiqlash
```tsx
const ok = await confirm({
  title: "Buyurtma o'chirilsinmi?",
  description: "Bu amalni qaytarib bo'lmaydi.",
  confirmText: "O'chirish",
  variant: "danger",
});
```
- `danger` bo'lsa — dastlabki fokus **"Bekor qilish"** da (tasodifan Enter bosib o'chirib yubormaslik uchun)
- Tasdiqlash tugmasi async bo'lsa — `loading` holatiga o'tadi, dialog javob kelguncha yopilmaydi

---

## Drawer (Sheet)

**Asos:** `@radix-ui/react-dialog` (Dialog'ning boshqa ko'rinishi)

| Prop | Tip | Default |
|---|---|---|
| `side` | `right \| left \| bottom \| top` | `right` |
| `size` | `sm \| md \| lg` | `md` (320 / 420 / 560px; `bottom` da — balandlik) |

API — Dialog bilan bir xil (`Drawer.Trigger`, `Drawer.Content`, `Drawer.Footer`).
**Animatsiya:** `translateX(100%→0)` 300ms / chiqish 200ms. `bottom` da — yuqorida "tutqich" chizig'i.
**Ishlatilishi:** filtrlar paneli, mobil menyu, tafsilotlar ko'rinishi.

---

## Dropdown Menu

**Asos:** `@radix-ui/react-dropdown-menu`

```tsx
<DropdownMenu>
  <DropdownMenu.Trigger asChild><IconButton aria-label="Amallar"><Dots /></IconButton></DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    <DropdownMenu.Item icon={<Edit />} shortcut={["mod", "E"]} onSelect={edit}>Tahrirlash</DropdownMenu.Item>
    <DropdownMenu.Item icon={<Copy />}>Nusxa olish</DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item icon={<Trash />} variant="danger">O'chirish</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu>
```

Qo'shimcha qismlar: `Label` (guruh sarlavhasi), `CheckboxItem`, `RadioGroup` + `RadioItem`, `Sub` (ichki menyu).

| Element | Dizayn |
|---|---|
| Panel | `surface`, radius `xl` (16), soya `md`, padding 6px, min-kenglik 180px |
| Item | balandlik 36px, radius `md` (8), `text-sm`; ikonka chapda 16px, `Kbd` o'ngda |
| Highlight (hover / klaviatura) | `primary-soft` fon, `primary-soft-fg` matn |
| `danger` item | `danger-fg` matn, highlight'da `danger-soft` fon |

**Klaviatura:**
| Tugma | Harakat |
|---|---|
| `Enter` / `Space` / `↓` (trigger'da) | Ochish, birinchi elementga fokus |
| `↑ ↓` | Elementlar bo'ylab yurish (aylanma) |
| `Home` / `End` | Birinchi / oxirgi element |
| Harf | Shu harf bilan boshlanadigan elementga sakrash (typeahead) |
| `→` / `←` | Ichki menyuni ochish / yopish |
| `Enter` / `Space` | Tanlash va yopish |
| `Esc` | Yopish, fokus trigger'ga |

---

## Select

**Asos:** `@radix-ui/react-select`

```tsx
<Field label="Viloyat">
  <Select value={region} onValueChange={setRegion} placeholder="Tanlang">
    <Select.Item value="tsh">Toshkent</Select.Item>
    <Select.Item value="sam">Samarqand</Select.Item>
    <Select.Group label="Vodiy">
      <Select.Item value="fer">Farg'ona</Select.Item>
    </Select.Group>
  </Select>
</Field>
```

| Prop | Tip | Default |
|---|---|---|
| `value` / `defaultValue` / `onValueChange` | `string` | — |
| `placeholder` | `string` | `"Tanlang"` |
| `size` | `sm \| md \| lg` | `md` |
| `invalid`, `disabled` | `boolean` | — |

- **Trigger** — Input bilan bir xil ko'rinish (balandlik, radius, holatlar), o'ngda chevron (ochilganda 180° buriladi)
- **Panel** — Dropdown Menu bilan bir xil; tanlangan element yonida ✓; kenglik = trigger kengligi
- 8+ element bo'lsa — panel max balandligi 320px, ichida scroll
- **Klaviatura:** `↑ ↓`, `Home`/`End`, typeahead, `Enter` tanlash, `Esc` yopish
- **Qidiruv kerak bo'lsa → Combobox** (Select qidiruvsiz qoladi)

---

## Combobox (qidiruvli select)

**Asos:** Radix Popover + **`cmdk`** (Command Palette bilan bir xil asos — 3-darajada qayta ishlatiladi)

```tsx
<Combobox
  options={cities}                    // { value, label, description?, icon? }[]
  value={city} onValueChange={setCity}
  placeholder="Shahar tanlang"
  searchPlaceholder="Qidirish..."
  emptyText="Hech narsa topilmadi"
/>
<Combobox multiple value={tags} onValueChange={setTags} options={allTags} />
```

| Prop | Tip | Default |
|---|---|---|
| `options` | `Option[]` | — |
| `multiple` | `boolean` | `false` — tanlanganlar trigger'da Badge sifatida |
| `onSearch` | `(q) => void` | — server qidiruvi uchun (debounce 300ms) |
| `loading` | `boolean` | `false` — ro'yxat o'rnida Spinner |
| `creatable` | `boolean` | `false` — "+ «matn» yaratish" elementi |

**UX tafsilotlari:**
- Qidiruv **o'zbek harflariga sezgir emas**: `"gʻ"`, `"g'"`, `"g‘"` bir xil; kirill ↔ lotin ham topiladi (`"Тошкент"` → "Toshkent")
- Mos kelgan qism **qalin** bilan ajratiladi
- `multiple` da: `Backspace` (bo'sh qidiruvda) — oxirgi tanlovni o'chiradi
- Bo'sh natija — `emptyText` + (agar `creatable`) yaratish taklifi

**Klaviatura:** ochiq holda yozish — qidiruv; `↑ ↓` — yurish; `Enter` — tanlash; `Esc` — avval qidiruvni tozalaydi, ikkinchi marta — yopadi.

---

## Tooltip

**Asos:** `@radix-ui/react-tooltip`

```tsx
<Tooltip content="Nusxa olish" shortcut={["mod", "C"]}>
  <IconButton aria-label="Nusxa olish"><Copy /></IconButton>
</Tooltip>
```

| Prop | Tip | Default |
|---|---|---|
| `content` | `ReactNode` | — |
| `side` | `top \| right \| bottom \| left` | `top` |
| `delay` | `number` | `300` ms |
| `shortcut` | `string[]` | — matn yonida `Kbd` |

- **Dizayn:** teskari rangda — `slate-900` fon, oq matn, `text-xs`, radius `md`, padding 6×10, max kenglik 240px
- Bitta tooltip ochiq bo'lsa, qo'shnisiga o'tganda **kechikishsiz** ochiladi (skip delay)
- Faqat **qisqa matn** uchun — ichida tugma yoki havola bo'lmaydi (unda Popover)
- Klaviatura fokusida ham chiqadi; touch qurilmalarda chiqmaydi

---

## Popover

**Asos:** `@radix-ui/react-popover`

Ichida **interaktiv kontent** bo'ladigan suzuvchi panel (forma, filtr, rang tanlash).

```tsx
<Popover>
  <Popover.Trigger asChild><Button leftIcon={<Filter />}>Filtr</Button></Popover.Trigger>
  <Popover.Content side="bottom" align="start" className="w-72">...</Popover.Content>
</Popover>
```

- **Dizayn:** `surface`, radius `xl`, soya `lg`, padding 16px, ixtiyoriy strelka (`arrow`)
- Ochilganda fokus **ichidagi birinchi elementga** o'tadi
- Tooltip'dan farqi: bosish bilan ochiladi, ichida bosiladigan elementlar bo'lishi mumkin

---

## Tabs

**Asos:** `@radix-ui/react-tabs`

```tsx
<Tabs defaultValue="info" variant="underline">
  <Tabs.List>
    <Tabs.Trigger value="info">Ma'lumot</Tabs.Trigger>
    <Tabs.Trigger value="orders" badge={12}>Buyurtmalar</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="info">...</Tabs.Content>
</Tabs>
```

| Prop | Tip | Default |
|---|---|---|
| `variant` | `underline \| pills \| segmented` | `underline` |
| `size` | `sm \| md` | `md` |
| `orientation` | `horizontal \| vertical` | `horizontal` |

| Variant | Ko'rinish |
|---|---|
| `underline` | Faol tab ostida 2px `primary` chiziq — **chiziq siljib o'tadi** (200ms ease-in-out) |
| `pills` | Faol tab `primary-soft` fonda, radius `full` |
| `segmented` | `surface-muted` konteyner ichida faol tab oq "kartochka" + soya `xs` (iOS uslubi) — fon siljib o'tadi |

- Tablar ko'p bo'lsa — gorizontal scroll, chetlarida yumshoq "fade"
- **Klaviatura:** `← →` (vertikalda `↑ ↓`) — tablar bo'ylab; `Home`/`End`; fokus bilan darhol faollashadi

---

## Accordion

**Asos:** `@radix-ui/react-accordion`

```tsx
<Accordion type="single" collapsible defaultValue="q1">
  <Accordion.Item value="q1" title="Yetkazib berish qancha vaqt oladi?">2–3 ish kuni.</Accordion.Item>
</Accordion>
```

| Prop | Tip | Default |
|---|---|---|
| `type` | `single \| multiple` | `single` |
| `collapsible` | `boolean` | `true` |
| `variant` | `separated \| bordered \| ghost` | `separated` (har biri alohida karta) |

- Sarlavha — 48px balandlik, `text-sm` 500, o'ngda chevron (ochilganda 180°)
- Ochilish — balandlik animatsiyasi (Radix `--radix-accordion-content-height`) 200ms ease-in-out + kontent opacity
- **Klaviatura:** `Enter`/`Space` — ochish/yopish; `↑ ↓` — sarlavhalar bo'ylab; `Home`/`End`

---

## Toast

**Asos:** `@radix-ui/react-toast` + o'zimizning imperativ API

```tsx
toast("Saqlandi");
toast.success("Buyurtma yaratildi", { description: "#1042", action: { label: "Ko'rish", onClick } });
toast.error("Ulanib bo'lmadi. Qayta urinib ko'ring.");
const id = toast.loading("Yuklanmoqda...");
toast.success("Yuklandi", { id });          // o'sha toast'ni yangilaydi
toast.promise(save(), { loading: "Saqlanmoqda", success: "Saqlandi", error: "Xatolik" });
```

| Opsiya | Tip | Default |
|---|---|---|
| `type` | `default \| success \| error \| warning \| info \| loading` | `default` |
| `description` | `ReactNode` | — |
| `action` | `{ label, onClick }` | — (masalan "Bekor qilish" / undo) |
| `duration` | `number` | `4000` ms (`error` — 6000, `loading` — cheksiz) |

- **Joylashuv:** `<Toaster position="bottom-right" />` (telefonda — pastda, to'liq kenglik)
- **Dizayn:** `surface`, radius `xl`, soya `lg`, chapda status ikonkasi (rangli), `text-sm`
- **Stack:** ko'pi bilan 3 ta ko'rinadi; ustma-ust "dasta" bo'lib turadi, hover'da yoyiladi
- Hover yoki fokusda — taymer **to'xtaydi**
- O'ngga surish (swipe) — yopish
- **Animatsiya:** `translateY(16px→0)` 300ms spring / chiqish 200ms
- **Accessibility:** `role="status"` (`error` da `role="alert"`), `F8` — toast hududiga fokus

---

## Qarorlar (hal qilingan savollar)

- [x] Toast — **Radix Toast + o'z imperativ API'miz**. Dasta (stack) animatsiyasi og'ir chiqsa — `sonner` (uslubsiz rejim) ga o'tiladi; tashqi API (`toast()`) o'zgarmaydi
- [x] Dialog telefonda (< 640px) — **avtomatik** bottom-sheet; o'chirish uchun `mobileSheet={false}`
- [x] `HoverCard` — **hozircha yo'q**, kelajak rejasida
