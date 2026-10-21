# 3-daraja: murakkab komponentlar

> Holat: ✅ tasdiqlandi · Prototip: [../prototype/tier3.html](../prototype/tier3.html) · Umumiy qoidalar: [00-conventions.md](00-conventions.md) · 2-daraja: [02-interactive.md](02-interactive.md)
> Bu komponentlar 1- va 2-daraja ustiga quriladi (Button, Input, Popover, Dialog, Checkbox...).

| Komponent | Asos | Sabab |
|---|---|---|
| DataTable | **TanStack Table** (headless) | Saralash/filtr/sahifalash mantiqi murakkab va sinalgan |
| VirtualList | **TanStack Virtual** (headless) | Scroll hisob-kitoblari nozik |
| DatePicker | **react-day-picker** (uslubsiz) + `date-fns` (`uz` locale) | Kalendar accessibility'si qiyin; locale tayyor |
| Command Palette | **cmdk** + Dialog | Combobox bilan bir xil asos |
| FileUpload | 0 dan | Mantiq oddiy, UX'ni to'liq boshqarish kerak |
| MaskedInput | 0 dan (`core` dagi formatlash funksiyalari ustida) | O'zbek formatlari, kursor boshqaruvi |
| OTP Input | 0 dan | Kichik, aniq vazifa |

---

## DataTable

```tsx
<DataTable
  data={orders}
  columns={[
    { key: "id", header: "№", width: 80, sortable: true },
    { key: "customer", header: "Mijoz", sortable: true },
    { key: "total", header: "Summa", align: "right", sortable: true, cell: (r) => formatMoney(r.total) },
    { key: "status", header: "Holat", cell: (r) => <StatusBadge value={r.status} />, filter: "select" },
  ]}
  searchable
  selectable
  pagination={{ pageSize: 10 }}
  onRowClick={(row) => open(row.id)}
  rowActions={(row) => <DropdownMenu>...</DropdownMenu>}
/>
```

### Imkoniyatlar
| Imkoniyat | Tafsilot |
|---|---|
| **Saralash** | Sarlavha bosilganda: o'sish → kamayish → o'chiq. Ikonka: ↕ / ↑ / ↓. `Shift` + bosish — bir nechta ustun |
| **Qidiruv** | Jadval ustida umumiy qidiruv (`searchable`), debounce 300ms, o'zbek harflariga sezgir emas (Combobox bilan bir xil) |
| **Filtrlar** | Ustun bo'yicha: `select`, `multiselect`, `range` (son), `date` — "Filtrlar" Popover'ida; faol filtrlar Badge sifatida ko'rinadi, ✕ bilan o'chiriladi |
| **Tanlash** | `selectable` — chapda Checkbox; sarlavhadagi — "hammasi" (indeterminate holati bilan). Tanlanganda jadval ustida **ommaviy amallar paneli** ("3 ta tanlandi · O'chirish · Eksport") |
| **Sahifalash** | Pastda: "1–10 / 248", sahifa raqamlari, sahifa hajmi Select'i (10/25/50/100) |
| **Ustunlar** | "Ustunlar" menyusi — ko'rsatish/yashirish (CheckboxItem) |
| **Server rejimi** | `manual` — saralash/filtr/sahifa holati `onStateChange` orqali tashqariga, ma'lumot serverdan |
| **Yopishqoq** | Sarlavha `sticky`; ixtiyoriy birinchi ustun `sticky` (gorizontal scroll'da) |

### Holatlar
| Holat | Ko'rinish |
|---|---|
| Yuklanmoqda (birinchi marta) | Skeleton qatorlar (sahifa hajmicha) |
| Yuklanmoqda (qayta) | Mavjud ma'lumot 60% shaffof + yuqorida ingichka progress chizig'i — jadval "sakramaydi" |
| Bo'sh (ma'lumot yo'q) | Ikonka + "Hali buyurtmalar yo'q" + ixtiyoriy amal tugmasi |
| Bo'sh (filtr natijasi) | "Hech narsa topilmadi" + **"Filtrlarni tozalash"** tugmasi |
| Xato | Xato matni + "Qayta urinish" |

### Dizayn
- Konteyner: `surface`, radius `xl`, `border`; ichida jadval — qator balandligi 52px (`density="compact"` — 40px)
- Sarlavha: `surface-muted` fon, `text-xs` 500 `text-muted`
- Qator hover: `surface-muted`; tanlangan qator: `primary-soft`
- Raqamli ustunlar o'ngga tekislanadi, `tabular-nums`
- **Telefonda (< 640px):** ixtiyoriy `mobileView="cards"` — har bir qator karta ko'rinishida

### Klaviatura
`Tab` — sarlavha tugmalari, checkbox'lar va qator amallari bo'ylab; `Enter` — saralash / qatorni ochish; `Space` — qatorni tanlash.

---

## VirtualList

10 000+ elementni qotmasdan ko'rsatish — faqat ekranda ko'rinadigan qatorlar chiziladi.

```tsx
<VirtualList items={logs} estimateSize={48} height={480} overscan={8}
  renderItem={(item) => <LogRow log={item} />}
  onEndReached={loadMore}          // cheksiz scroll
/>
```

| Prop | Tip | Default |
|---|---|---|
| `estimateSize` | `number \| (i) => number` | — taxminiy qator balandligi |
| `dynamic` | `boolean` | `false` — qatorlar har xil balandlikda bo'lsa o'lchab oladi |
| `onEndReached` | `() => void` | — oxiriga 5 qator qolganda chaqiriladi |
| `loadingMore` | `boolean` | — pastda Spinner qatori |

- DataTable'da `virtual` prop orqali ham ishlatiladi (sahifalash o'rniga)
- `scrollToIndex(i)` — ref orqali

---

## DatePicker / DateRangePicker

```tsx
<Field label="Yetkazish sanasi">
  <DatePicker value={date} onValueChange={setDate} minDate={new Date()} />
</Field>
<DateRangePicker value={range} onValueChange={setRange} presets />
```

| Prop | Tip | Default |
|---|---|---|
| `value` / `onValueChange` | `Date \| null` (range: `{ from, to }`) | — |
| `minDate`, `maxDate` | `Date` | — |
| `disabledDates` | `(d: Date) => boolean` | — masalan dam olish kunlari |
| `format` | `string` | `"dd.MM.yyyy"` |
| `presets` | `boolean \| Preset[]` | — range uchun: "Bugun", "Oxirgi 7 kun", "Shu oy", "O'tgan oy" |
| `numberOfMonths` | `1 \| 2` | single — 1, range — 2 (telefonda 1) |

### Trigger
- Input ko'rinishida, chapda 📅 ikonka
- **Qo'lda yozish mumkin**: `25.12.2026` — yozilgan sana tahlil qilinadi; noto'g'ri bo'lsa `invalid`
- Yozish paytida niqob: `__.__.____`

### Kalendar (Popover ichida)
- **O'zbekcha:** oylar — Yanvar … Dekabr; kunlar — Du Se Ch Pa Ju Sh Ya; hafta **dushanbadan** boshlanadi
- Sarlavha: "Oktabr 2026" — bosilsa **oy/yil tanlash** ko'rinishi (uzoq sanaga tez o'tish, masalan tug'ilgan kun)
- Bugungi kun — `primary` rangli nuqta yoki halqa; tanlangan — `primary` fon, oq matn
- Range: boshlanish/tugash — `primary`, oraliq — `primary-soft` fon; hover'da oraliq oldindan ko'rinadi
- O'tib ketgan / ruxsat etilmagan kunlar — `text-faint`, bosilmaydi
- Kun katagi: 36×36px, radius `md`

### Klaviatura
| Tugma | Harakat |
|---|---|
| `← →` | ±1 kun |
| `↑ ↓` | ±1 hafta |
| `PageUp` / `PageDown` | ±1 oy (`Shift` bilan — ±1 yil) |
| `Home` / `End` | Hafta boshi / oxiri |
| `Enter` / `Space` | Tanlash |
| `Esc` | Yopish |

---

## Command Palette

`Ctrl+K` (macOS'da `⌘K`) bilan ochiladigan global qidiruv va buyruqlar oynasi.

```tsx
<CommandPalette
  hotkey="mod+k"
  placeholder="Qidirish yoki buyruq yozish..."
  groups={[
    { heading: "Sahifalar", items: [{ label: "Buyurtmalar", icon: <Box />, onSelect: () => nav("/orders") }] },
    { heading: "Amallar", items: [{ label: "Yangi buyurtma", icon: <Plus />, shortcut: ["mod", "N"], onSelect: create }] },
  ]}
  onSearch={async (q) => searchServer(q)}   // ixtiyoriy: server natijalari alohida guruhda
/>
```

- Dialog asosida: yuqoridan 20% pastda, kenglik 560px, radius `2xl`
- Qidiruv maydoni yuqorida (katta, 48px), ostida guruhlangan natijalar, pastda yordam qatori: `↑↓ yurish · ↵ tanlash · Esc yopish`
- Qidiruv **fuzzy** (harflar ketma-ketligi bo'yicha) + o'zbek normallashtirish
- **Oxirgi ishlatilganlar** — bo'sh qidiruvda birinchi guruh (`localStorage`)
- **Ichki sahifalar:** element tanlanganda yangi ro'yxat ochilishi mumkin (masalan "Mavzu" → Light / Dark), `Backspace` — orqaga
- Klaviatura: `↑ ↓`, `Enter`, `Esc`, `Ctrl+K` — ochish/yopish

---

## FileUpload

```tsx
<FileUpload
  accept={["image/*", ".pdf"]}
  maxSize={5 * 1024 * 1024}
  maxFiles={5}
  multiple
  upload={(file, { onProgress, signal }) => api.upload(file, { onProgress, signal })}
  onFilesChange={setFiles}
/>
```

| Prop | Tip | Default |
|---|---|---|
| `accept` | `string[]` | — |
| `maxSize` | `number` (bayt) | — |
| `maxFiles` | `number` | — |
| `upload` | `(file, ctx) => Promise<Result>` | — bo'lmasa faqat tanlash (forma bilan yuboriladi) |
| `variant` | `dropzone \| button \| avatar` | `dropzone` |

### Dropzone holatlari
| Holat | Ko'rinish |
|---|---|
| Bo'sh | Uzuq chiziqli (`dashed`) chegara, ikonka, "Faylni shu yerga tashlang yoki **tanlang**", pastda cheklovlar ("PNG, JPG, PDF · 5 MB gacha") |
| Sudrab olib kelinmoqda (drag over) | Chegara `primary`, fon `primary-soft`, ikonka biroz kattalashadi |
| Noto'g'ri fayl sudralmoqda | Chegara `danger`, "Bu turdagi fayl qabul qilinmaydi" |

### Fayllar ro'yxati
Har bir fayl — qator: preview (rasm bo'lsa — kichik rasm, aks holda tur ikonkasi), nom (o'rtadan qisqartiriladi: `hisobot-oktab…2026.pdf`), hajm (`formatFileSize`), holat:
- **Yuklanmoqda** — progress chizig'i + foiz + ✕ (bekor qilish, `AbortController`)
- **Tayyor** — yashil ✓, ✕ o'chirish
- **Xato** — qizil matn ("Hajmi 5 MB dan katta", "Tarmoq xatosi") + "Qayta urinish"

### Qo'shimcha
- **Clipboard'dan joylash** (`Ctrl+V`) — skrinshotni to'g'ridan-to'g'ri qo'yish
- Dropzone klaviatura bilan fokuslanadi, `Enter`/`Space` — fayl tanlash oynasi
- `avatar` varianti — doira, rasm tanlangach **kesish (crop)** — *kelajak rejasi*

---

## MaskedInput

Input ustida qurilgan, foydalanuvchi yozayotganda formatlaydi. Ichki qiymat — **toza** (faqat raqamlar), ko'rinish — formatlangan.

```tsx
<PhoneInput value={phone} onValueChange={setPhone} />        // value: "901234567", ko'rinish: "+998 (90) 123-45-67"
<MoneyInput value={sum} onValueChange={setSum} currency="so'm" />  // value: 1250000, ko'rinish: "1 250 000 so'm"
<CardInput value={card} onValueChange={setCard} />           // value: "8600123412341234", ko'rinish: "8600 1234 1234 1234" + logo
<MaskedInput mask="AA 9999999" />                            // umumiy: pasport "AB 1234567"
```

| Komponent | Tafsilot |
|---|---|
| `PhoneInput` | `+998` prefix sifatida (o'chirib bo'lmaydi); operator kodi validatsiyasi (33, 50, 55, 77, 88, 90, 91, 93, 94, 95, 97, 98, 99); `+998` bilan joylansa ham to'g'ri tushadi |
| `MoneyInput` | Minglik ajratuvchi — bo'sh joy; `decimals` (0 default); `min`/`max`; mobilda raqamli klaviatura (`inputMode="numeric"`) |
| `CardInput` | 4 tadan guruh; o'ngda karta turi logosi: **Uzcard** (8600), **Humo** (9860), Visa (4), Mastercard (5); Luhn tekshiruvi |
| `MaskedInput` | Belgilar: `9` — raqam, `A` — harf, `*` — istalgan; qolgani — doimiy belgi |

**Kursor qoidasi:** formatlash paytida kursor "sakramaydi" — o'rtadan tahrirlansa ham joyida qoladi. `Backspace` doimiy belgini (`-`, bo'sh joy) emas, oldingi raqamni o'chiradi.

---

## OTP Input

```tsx
<OtpInput length={6} value={code} onValueChange={setCode} onComplete={verify} />
```

| Prop | Tip | Default |
|---|---|---|
| `length` | `number` | `6` |
| `type` | `numeric \| alphanumeric` | `numeric` |
| `onComplete` | `(code) => void` | — oxirgi raqam kiritilganda |
| `invalid` | `boolean` | — xato bo'lsa katakchalar qizil + yengil **silkinish** animatsiyasi (reduced-motion'da yo'q) |
| `groupSize` | `number` | — masalan `3` → `123 – 456` |

- Katakchalar: 48×56px, radius `lg`, `text-xl` 600, `tabular-nums`; faol katakcha — `primary` chegara + ring, ichida miltillovchi kursor
- **Joylash (paste)** — 6 raqamni bitta katakka joylasa ham hammasi to'ladi
- SMS'dan avtomatik to'ldirish: `autocomplete="one-time-code"`
- `Backspace` — oldingi katakka qaytadi; `← →` — katakchalar bo'ylab
- Ostida ixtiyoriy: "Kodni qayta yuborish (0:59)" — taymer bilan (bu alohida `ResendTimer` yordamchisi)

---

## Qarorlar (hal qilingan savollar)

- [x] DataTable telefonda — default **gorizontal scroll**; `mobileView="cards"` — ixtiyoriy
- [x] Vaqt tanlash — hozircha **yo'q**; alohida `TimePicker` kelajak rejasida
- [x] FileUpload'da rasm kesish (crop) — **kelajak rejasi**
- [x] Hijriy / boshqa kalendarlar — **yo'q**, faqat grigorian

## Prototipdan saboqlar

- VirtualList prototipda yo'q — ishlash tezligi kod bosqichida 10 000+ qator bilan o'lchanadi
- Masked input'larda yordamchi matnni qayta chizishda `id` lar saqlanishi kerak (prototipda xato topildi)
- Input'ning o'z `:focus-visible` halqasi o'chiriladi — fokus konteyner (`.ip`) orqali ko'rsatiladi, aks holda ikki halqa chiqadi
