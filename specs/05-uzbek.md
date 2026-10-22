# 5-daraja: o'zbekcha lokalizatsiya (3-guruh)

> Holat: ✅ tasdiqlandi · Umumiy qoidalar: [00-conventions.md](00-conventions.md)
> Maqsad: kutubxonani boshqalaridan ajratib turadigan — o'zbek ilovalari uchun qutidan tayyor yechimlar.
> Reja: `@akhatmirzo/core@0.2.0` va `@akhatmirzo/ui@0.3.0` (minor) — mavjud API buzilmaydi.

---

## Hozir bor (o'zgarmaydi, faqat ustiga quriladi)

| Sohasi | Mavjud |
|---|---|
| Alifbo | `cyrToLat`, `latToCyr`, `normalizeUz`, `searchMatch` |
| Pul / son | `formatNumber`, `formatMoney`, `formatFileSize` |
| Sana | `formatDate` (tokenlar), `parseDate`, `timeAgo`, `MONTHS_UZ`, `WEEKDAYS_UZ` |
| Telefon / karta | `formatPhone`, `parsePhone`, `isValidPhone`, `formatCardNumber`, `detectCardBrand`, `isValidCardNumber` |
| UI | `PhoneInput`, `MoneyInput`, `CardInput`, `MaskedInput`, `DatePicker` |

## Umumiy qoida — `script` opsiyasi

Matn qaytaradigan barcha yangi funksiyalar `script?: 'latin' | 'cyrillic'` opsiyasini oladi (default `'latin'`). Kirill natija `latToCyr` orqali olinadi — lug'at bitta joyda.
Apostroflar: natijada **tipografik** belgilar — `oʻ gʻ` (U+02BB), tutuq belgisi `ʼ` (U+02BC). `apostrophe: 'ascii'` opsiyasi bilan oddiy `'`.

---

## A. Son va pul so'z bilan — `@akhatmirzo/core`

```ts
numberToWords(1_250_000)                  // "bir million ikki yuz ellik ming"
numberToWords(1_250_000, { script: 'cyrillic' }) // "бир миллион икки юз эллик минг"
moneyToWords(1_250_000.5)                 // "Bir million ikki yuz ellik ming soʻm 50 tiyin"
ordinal(3)                                // "3-"
ordinalWords(3)                           // "uchinchi"
```

| Funksiya | Opsiyalar | Izoh |
|---|---|---|
| `numberToWords(n, opts?)` | `script`, `apostrophe`, `formal?: boolean` | Butun son, `±999 999 999 999 999` gacha (trillion). Kasr qismi tashlanadi. Manfiy → `"minus …"`. `0` → `"nol"`. `formal: true` → `"bir yuz"`, `"bir ming"` (rasmiy hujjatlar uslubi); default `"yuz"`, `"ming"` |
| `moneyToWords(amount, opts?)` | `script`, `apostrophe`, `formal`, `currency?: "so'm" \| 'UZS' \| string`, `tiyin?: 'words' \| 'digits' \| false`, `capitalize?: boolean` | Default: `tiyin: 'digits'` (hisob-faktura uslubi: `"… soʻm 50 tiyin"`), `capitalize: true`. 0 tiyin → tiyin qismi yozilmaydi |
| `ordinal(n)` | — | `"3-"` (raqam + defis) |
| `ordinalWords(n, opts?)` | `script`, `apostrophe` | Unli bilan tugasa `-nchi` (`ikkinchi`), aks holda `-inchi` (`uchinchi`, `to'rtinchi`) |

**Test to'plami** (majburiy): 0, 1, 10, 11, 19, 20, 21, 99, 100, 101, 110, 999, 1 000, 1 001, 10 000, 100 000, 1 000 000, 1 000 001, 2 300 000 000, 10¹², manfiy, kasr, `NaN`/`Infinity` → `''`.

---

## B. Sana va vaqt — `@akhatmirzo/core`

O'zbek imlosi bo'yicha: oy nomlari kichik harf bilan, kun va yil defis bilan (`22-oktabr`, `2026-yil`).

```ts
formatDateUz(d)                     // "22-oktabr, 2026-yil"           (long — default)
formatDateUz(d, { style: 'full' })  // "2026-yil 22-oktabr, payshanba"
formatDateUz(d, { style: 'short' }) // "22-okt, 2026"
formatDateUz(d, { style: 'dayMonth' })  // "22-oktabr"
formatDateUz(d, { style: 'monthYear' }) // "oktabr, 2026-yil"
formatDateUz(d, { style: 'long', time: true }) // "22-oktabr, 2026-yil, 14:30"

formatDateRange(a, b)               // "20–22-oktabr, 2026-yil" · "30-sentabr – 2-oktabr, 2026-yil" · yillar farq qilsa — ikkalasi to'liq
formatDuration(8_100_000)           // "2 soat 15 daqiqa"
formatDuration(90_061_000, { units: 3 }) // "1 kun 1 soat 1 daqiqa"
formatDuration(45_000, { style: 'short' }) // "45 s"   (short: "2 soat 15 daq")
```

| Funksiya | Opsiyalar |
|---|---|
| `formatDateUz(date, opts?)` | `style: 'long' \| 'full' \| 'short' \| 'dayMonth' \| 'monthYear'`, `time?: boolean`, `script` |
| `formatDateRange(start, end, opts?)` | `style: 'long' \| 'short'`, `script`; bir kun bo'lsa — bitta sana |
| `formatDuration(ms, opts?)` | `units?: number` (default 2 — eng katta 2 birlik), `style: 'long' \| 'short'`, `script`; birliklar: kun, soat, daqiqa, soniya; `< 1 s` → `"0 soniya"` |

Mavjud `formatDate` / `MONTHS_UZ` o'zgarmaydi (bosh harfli nomlar saqlanadi — orqaga moslik).

---

## C. Alifbo vositalari — `@akhatmirzo/core`

```ts
detectScript('Salom dunyo')    // 'latin'
detectScript('Салом')          // 'cyrillic'
detectScript('Salom Салом')    // 'mixed'      · faqat raqam/belgi → 'none'
toScript('Салом, дунё', 'latin')   // "Salom, dunyo"  (manba avtomatik aniqlanadi; allaqachon to'g'ri bo'lsa — o'zgarmaydi)
fixApostrophes("O'zbekiston g'alabasi, ma'no")  // "Oʻzbekiston gʻalabasi, maʼno"
fixApostrophes('Oʻzbekiston', { style: 'ascii' }) // "O'zbekiston"
```

`fixApostrophes`: `o`/`g` dan keyingi har qanday apostrof varianti (`' ‘ ’ \` ´`) → `ʻ` (U+02BB); boshqa joydagi tutuq belgisi → `ʼ` (U+02BC). So'z chegarasidagi qo'shtirnoq vazifasidagi `'…'` ga tegilmaydi (test bilan).

---

## D. O'zbek hujjat identifikatorlari — `@akhatmirzo/core`

Har biri uchun `isValidX`, `formatX` (ko'rsatish uchun), kerak joyda `parseX`.

| Identifikator | Format | Tekshiruv | Parse |
|---|---|---|---|
| **JShShIR / PINFL** | 14 raqam | 1-raqam 3–6; 2–7-raqamlar — tug'ilgan sana `DDMMYY` (haqiqiy sana); nazorat raqami (7-3-1 og'irliklar, mod 10) — **haqiqiy namunalar bilan tasdiqlanadi**, tasdiqlanmasa opsiya bo'lib qoladi (`checksum: false` default) | `parsePinfl` → `{ gender: 'male' \| 'female', birthDate: Date }` (3/5 — erkak, 4/6 — ayol; 3/4 — 1900-yillar, 5/6 — 2000-yillar) |
| **STIR / INN** | 9 raqam, 0 bilan boshlanmaydi | format | — |
| **Pasport / ID karta** | `AA1234567` — 2 lotin bosh harf + 7 raqam | format (kichik harf va bo'sh joy normallashtiriladi) | — |
| **Avtomobil raqami** | jismoniy: `01 A 123 BC` · yuridik: `01 123 ABC` | format + hudud kodi ro'yxatda | `parseCarPlate` → `{ region, type: 'personal' \| 'legal' }` |
| **Bank hisob raqami** | 20 raqam, ko'rsatishda `2020 8000 9000 1234 5001` | format | — |
| **MFO (bank kodi)** | 5 raqam | format | — |

**Hududlar** — `UZ_REGIONS` (14 ta): `{ id, name, nameCyr, center, plateCodes }` — Qoraqalpogʻiston Respublikasi, 12 viloyat, Toshkent shahri. Avto-raqam kodlari (diapazon): 01–09 Toshkent sh., 10–19 Toshkent vil., 20–24 Sirdaryo, 25–29 Jizzax, 30–39 Samarqand, 40–49 Fargʻona, 50–59 Namangan, 60–69 Andijon, 70–74 Qashqadaryo, 75–79 Surxondaryo, 80–84 Buxoro, 85–89 Navoiy, 90–94 Xorazm, 95–99 Qoraqalpogʻiston.
Tumanlar (≈200 ta) — **bu bosqichda yo'q** (ma'lumot hajmi va aniqligi alohida tekshiruv talab qiladi); keyingi bosqichga.

---

## E. UI — `@akhatmirzo/ui`

### `ScriptProvider` + `useScript` + `Translit` + `ScriptToggle`

Ilova kontentini foydalanuvchi tanlagan alifboda ko'rsatish (lotin bazada saqlanadi, kirillda ko'rsatiladi yoki aksincha).

```tsx
<ScriptProvider defaultScript="latin" storageKey="script">   {/* tanlov localStorage'da eslab qolinadi (ixtiyoriy) */}
  <ScriptToggle />                                             {/* "Lotin | Кирилл" — SegmentedControl asosida */}
  <h1><Translit>Oʻzbekiston boʻylab yetkazib berish</Translit></h1>
</ScriptProvider>

const { script, setScript, t } = useScript();   // t('Salom') → joriy alifboda
```

| Qism | Props |
|---|---|
| `ScriptProvider` | `script` / `defaultScript` / `onScriptChange`, `storageKey?: string` (SSR'da `defaultScript` bilan render, gidratatsiyadan keyin o'qiladi) |
| `Translit` | `children: string`, `as?` (default `span`); provider bo'lmasa — matn o'zgarmaydi |
| `ScriptToggle` | `size`, `labels: { latin, cyrillic, group }` → `"Lotin"`, `"Кирилл"`, `"Alifbo"`; `SegmentedControl` prop'lari |

`<html lang>` ga tegilmaydi; `Translit` elementiga `lang="uz-Cyrl"` / `lang="uz-Latn"` qo'yiladi (ekran o'quvchi va SEO uchun).

### Hujjat inputlari (`MaskedInput` presetlari, `PhoneInput` uslubida)

| Komponent | Maska | Qo'shimcha |
|---|---|---|
| `PinflInput` | `00000 00000 0000` (ko'rsatish), qiymat — 14 raqam | to'liq kiritilganda `onDetails({ valid, gender, birthDate })` |
| `PassportInput` | `AA 0000000` | harflar avtomatik katta, faqat lotin |
| `InnInput` | `000 000 000` | — |
| `CarPlateInput` | jismoniy / yuridik formatni avtomatik aniqlaydi | chapda hudud kodi bloki (haqiqiy raqam ko'rinishiga o'xshash), `onDetails({ region, type })` |
| `BankAccountInput` | `0000 0000 0000 0000 0000` | — |

Hammasi `Field` bilan ishlaydi, `invalid` holat `isValidX` dan, `value` — tozalangan qiymat (bo'sh joysiz).

### `MoneyInput` — `showWords`

```tsx
<MoneyInput value={amount} onValueChange={setAmount} showWords />
// ostida: "Bir million ikki yuz ellik ming soʻm"
```
`showWords?: boolean | { formal?, script? }` — `Field` description o'rnida (yoki ostida) `text-text-muted text-xs`, `aria-live="polite"`.

### `RegionSelect`

`Select` preseti, `UZ_REGIONS` dan: `value` — region `id`; `script` ga qarab nomlar; `includeCity?: boolean` (Toshkent shahri, default `true`).

---

## Docs

| Sahifa | Mazmun |
|---|---|
| `core/format` (mavjud, kengaytiriladi) | `numberToWords`, `moneyToWords`, `ordinal*`, `formatDateUz`, `formatDateRange`, `formatDuration` |
| `core/text` (mavjud, kengaytiriladi) | `detectScript`, `toScript`, `fixApostrophes` |
| `core/identifiers` (**yangi**) | JShShIR, STIR, pasport, avto-raqam, hisob raqami, MFO, `UZ_REGIONS` |
| `components/script` (**yangi**) | ScriptProvider, Translit, ScriptToggle, useScript |
| `components/document-inputs` (**yangi**) | PinflInput, PassportInput, InnInput, CarPlateInput, BankAccountInput |
| `components/masked-input` (mavjud) | `MoneyInput showWords` bo'limi |
| `components/select` (mavjud) | `RegionSelect` bo'limi |

Docs `v0.2` papkasida (eng so'nggi), relizda `docs:version v0.2 v0.3`.

---

## Bajarish tartibi

| Bosqich | Agent | Ish |
|---|---|---|
| 1 (parallel) | A | §A son/pul so'z bilan + §B sana/vaqt (core) |
| 1 (parallel) | B | §C alifbo + §D identifikatorlar va hududlar (core) |
| 2 | C | §E UI (A va B tayyor bo'lgach) |
| 3 | Nazoratchi | spetsifikatsiya, imlo (o'zbek tili qoidalari), testlar, docs |

**Tayyor mezoni:** funksiya/komponent + testlar (yuqoridagi test to'plamlari) · docs uz + en · playground · typecheck, lint, format, test, build · changeset (`core` minor, `ui` minor).
