# @akhatmirzo/core

[![npm](https://img.shields.io/npm/v/@akhatmirzo/core?color=4f46e5)](https://www.npmjs.com/package/@akhatmirzo/core)
[![npm yuklab olishlar](https://img.shields.io/npm/dm/@akhatmirzo/core?label=yuklab%20olishlar)](https://www.npmjs.com/package/@akhatmirzo/core)
[![CI](https://github.com/Akhatmirzo/akhatmirzo-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/Akhatmirzo/akhatmirzo-toolkit/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Litsenziya: MIT](https://img.shields.io/badge/litsenziya-MIT-22c55e)](https://github.com/Akhatmirzo/akhatmirzo-toolkit/blob/main/LICENSE)

**O'zbek tili va O'zbekiston formatlari uchun toza TypeScript funksiyalar: so'm, `+998`,
Uzcard/Humo, lotin ↔ kirill, JShShIR va STIR, sonlar so'z bilan — va zod sxemalari.**

Hujjatlar: **https://toolkit.akhatmirzo.uz/uz/docs/v0.4/core/format**

- **Bog'liqliksiz** — `dependencies` bo'sh, React ham kerak emas. Brauzerda, Node 20+ da va
  istalgan freymvorkda ishlaydi.
- **SSR-xavfsiz** — import paytida brauzer API'lariga tegmaydi; `createStorage` `localStorage` bo'lmagan muhitda ham xato bermaydi.
- **Tree-shaking** — ESM, `sideEffects: false`: faqat import qilingan funksiyalar bundle'ga
  tushadi.
- **To'liq tiplangan** — TypeScript `strict`, funksiyalar JSDoc izohlari bilan.
- **Zod sxemalari** — alohida `@akhatmirzo/core/zod` kirish nuqtasida (`zod` — ixtiyoriy peer).

```bash
pnpm add @akhatmirzo/core
```

## Formatlash

```ts
import {
  formatCardNumber,
  formatDate,
  formatFileSize,
  formatMoney,
  formatNumber,
  formatPhone,
  parseDate,
  timeAgo,
} from '@akhatmirzo/core';

formatMoney(1250000); // "1 250 000 so'm"
formatMoney(99.5, { currency: 'UZS', decimals: 2 }); // '99.50 UZS'
formatMoney(1250000, { currency: false }); // '1 250 000'
formatNumber(1234567.89); // '1 234 567.89'

formatPhone('901234567'); // '+998 90 123 45 67'
formatPhone('901234567', 'national'); // '(90) 123-45-67'
formatCardNumber('8600123412341234'); // '8600 1234 1234 1234'

formatDate(new Date(2026, 9, 21)); // '21.10.2026'
formatDate(new Date(2026, 9, 21), 'd MMMM yyyy, EEEE'); // '21 Oktabr 2026, Chorshanba'
parseDate('31.02.2026'); // null — bunday sana yo'q
timeAgo(new Date(Date.now() - 5 * 60_000)); // '5 daqiqa oldin'

formatFileSize(1536); // '1.5 KB'
formatFileSize(3_400_000); // '3.2 MB'
```

Konstantalar: `MONTHS_UZ`, `MONTHS_UZ_SHORT`, `WEEKDAYS_UZ`, `WEEKDAYS_UZ_SHORT` (hafta
dushanbadan) va `weekdayIndex(date)` — dushanba `0`, yakshanba `6`.

## Validatsiya

```ts
import {
  detectCardBrand,
  isValidCardNumber,
  isValidEmail,
  isValidPhone,
  parsePhone,
  passwordStrength,
} from '@akhatmirzo/core';

parsePhone('+998 90 123-45-67'); // { digits: '901234567', operator: '90', valid: true }
isValidPhone('+998 12 345 67 89'); // false — bunday operator kodi yo'q

detectCardBrand('8600123412341234'); // 'uzcard'
detectCardBrand('9860123412341234'); // 'humo'
isValidCardNumber('4111 1111 1111 1111'); // true (Luhn)

isValidEmail('ali@mail'); // false
passwordStrength('Parol123!'); // { score: 3, label: 'Yaxshi', checks: { length: true, ... } }
```

Shuningdek: `luhnCheck`, `UZ_OPERATOR_CODES`.

## Matn va qidiruv

```ts
import {
  cyrToLat,
  fuzzyMatch,
  latToCyr,
  normalizeUz,
  searchMatch,
  slugify,
  splitByRanges,
  truncateMiddle,
} from '@akhatmirzo/core';

cyrToLat('Ўзбекистон'); // "O'zbekiston"
latToCyr("G'ijduvon"); // 'Ғиждувон'

// Apostrofning barcha shakllari va kirill yozuv bitta kalitga keladi
normalizeUz('Gʻuzor') === normalizeUz("G'uzor"); // true

// Lotin matnni kirillcha so'rov bilan topish; o'rinlar asl matnda
searchMatch('Toshkent', 'тош'); // { match: true, ranges: [[0, 4]] }
splitByRanges('Toshkent', [[0, 4]]); // [{ text: 'Tosh', match: true }, { text: 'kent', match: false }]

fuzzyMatch('Yangi buyurtma', 'ybuy'); // { score, ranges: [[0, 1], [6, 9]] } yoki null

slugify("Farg'ona viloyati"); // 'fargona-viloyati'
slugify('Ўзбекистон Республикаси'); // 'ozbekiston-respublikasi'
truncateMiddle('hisobot-oktabr-2026.pdf', 22); // 'hisobot-oktab…2026.pdf'
```

Shuningdek: `truncate`, `capitalize`, `isApostrophe`, `UZ_APOSTROPHES`.

## O'zbekcha sonlar, sanalar va yozuv

```ts
import {
  detectScript,
  fixApostrophes,
  formatDateRange,
  formatDateUz,
  formatDuration,
  moneyToWords,
  numberToWords,
  ordinalWords,
  toScript,
} from '@akhatmirzo/core';

numberToWords(1_250_000); // 'bir million ikki yuz ellik ming'
moneyToWords(1_250_000.5); // 'Bir million ikki yuz ellik ming soʻm 50 tiyin'
ordinalWords(3); // 'uchinchi'

formatDateUz(new Date(2026, 9, 22)); // '22-oktabr, 2026-yil'
formatDateUz(new Date(2026, 9, 22), { style: 'full' }); // '2026-yil 22-oktabr, payshanba'
formatDateRange(new Date(2026, 9, 20), new Date(2026, 9, 22)); // '20–22-oktabr, 2026-yil'
formatDuration(8_100_000); // '2 soat 15 daqiqa'

detectScript('Салом'); // 'cyrillic'
toScript('Салом, дунё', 'latin'); // 'Salom, dunyo'
fixApostrophes("O'zbekiston g'alabasi"); // 'Oʻzbekiston gʻalabasi'
```

Ko'p funksiyalar `{ script: 'cyrillic' }` opsiyasini qabul qiladi. Shuningdek: `ordinal`
(`'22-'`).

## Hujjat raqamlari va hududlar

```ts
import {
  formatCarPlate,
  formatPinfl,
  isValidInn,
  isValidPassport,
  parseCarPlate,
  parsePinfl,
  regionByPlateCode,
  UZ_REGIONS,
} from '@akhatmirzo/core';

parsePinfl('31503901234567'); // { gender: 'male', birthDate: Date(1990-03-15) }
formatPinfl('31503901234567'); // '31503 90123 4567'
isValidInn('123 456 789'); // true — STIR
isValidPassport('ad 1234567'); // true

formatCarPlate('01a123bc'); // '01 A 123 BC'
parseCarPlate('30 123 abc')?.type; // 'legal'
regionByPlateCode('01')?.id; // 'tashkent-city'
UZ_REGIONS.find((r) => r.id === 'fergana')?.name; // 'Fargʻona viloyati'
```

Shuningdek: `isValidPinfl`, `formatInn`, `formatPassport`, `isValidBankAccount`,
`formatBankAccount`, `isValidMfo`, `isValidCarPlate`.

## Zod sxemalari — `@akhatmirzo/core/zod`

`zUz` — O'zbekiston ma'lumotlari uchun tayyor [zod](https://zod.dev) (v4) sxemalari. Hammasi
yuqoridagi `isValidX` / `parseX` funksiyalariga tayanadi, xato matnlari o'zbekcha va natija
tozalangan qiymat bo'ladi. `zod` — ixtiyoriy peer bog'liqlik:

```bash
pnpm add zod
```

```ts
import { zUz } from '@akhatmirzo/core/zod';
import { z } from 'zod';

const schema = z.object({
  phone: zUz.phone(),
  pinfl: zUz.pinfl(),
  amount: zUz.money({ min: 1000 }),
  region: zUz.region(),
});

schema.parse({
  phone: '+998 90 123-45-67', // → '998901234567'
  pinfl: '31503 90123 4567', // → '31503901234567'
  amount: '1 250 000', // → 1250000
  region: 'samarkand',
});

zUz.phone().safeParse('123').error?.issues[0].message; // "Telefon raqami noto'g'ri"
zUz.password({ messages: { weak: 'Kuchliroq parol tanlang' } });
```

| Sxema                                  | Tekshiradi                                        | Natija                    |
| -------------------------------------- | ------------------------------------------------- | ------------------------- |
| `zUz.phone()`                          | O'zbekiston mobil raqami                          | `'998901234567'`          |
| `zUz.pinfl({ checksum? })`             | JShShIR (PINFL), 14 raqam                         | raqamlar, bo'shliqsiz     |
| `zUz.inn()`                            | STIR (INN), 9 raqam                               | raqamlar                  |
| `zUz.passport()`                       | Pasport / ID karta seriya-raqami                  | `'AA1234567'`             |
| `zUz.carPlate()`                       | Avtomobil davlat raqami                           | `'01A123BC'`              |
| `zUz.bankAccount()`                    | Bank hisob raqami, 20 raqam                       | raqamlar                  |
| `zUz.mfo()`                            | MFO — bank filiali kodi, 5 raqam                  | raqamlar (`0` saqlanadi)  |
| `zUz.card()`                           | Bank kartasi, 16 raqam va Luhn                    | raqamlar                  |
| `zUz.email()`                          | Email manzil                                      | bo'shliqlarsiz            |
| `zUz.password({ minScore? = 2 })`      | `passwordStrength` bo'yicha kuchlilik             | o'zgarmaydi               |
| `zUz.money({ min?, max? })`            | Son yoki `'1 250 000'`, `"1 250 000 so'm"` matni  | `number`                  |
| `zUz.region()`                         | `UZ_REGIONS` dagi hudud `id` si                   | `UzRegionId`              |

Har bir sxema `messages` opsiyasi bilan xato matnlarini almashtirishga imkon beradi. Formalarda —
[`@akhatmirzo/ui/form`](https://www.npmjs.com/package/@akhatmirzo/ui) va `zodResolver` bilan.

## Storage va API

```ts
import { createApiClient, createStorage, isApiError } from '@akhatmirzo/core';

const storage = createStorage({ prefix: 'app:' });
storage.set('token', 'abc', { ttl: 60 * 60 * 1000 }); // 1 soatdan keyin o'zi o'chadi
storage.get<string>('token'); // 'abc' yoki null

const api = createApiClient({
  baseUrl: 'https://api.example.uz/v1',
  getToken: () => storage.get<string>('token'), // Authorization: Bearer <token>
  timeout: 15_000,
});

try {
  const orders = await api.get<Order[]>('/orders', { query: { page: 1 } });
} catch (error) {
  if (isApiError(error)) {
    console.log(error.code, error.status, error.message); // 'HTTP' | 'NETWORK' | 'TIMEOUT' | 'ABORTED' | 'PARSE'
  }
}
```

Xato xabarlari o'zbekcha (`httpErrorMessage(404)` → `'Topilmadi.'`). Shuningdek:
`createMemoryStorage` (testlar va SSR uchun), `ApiError`, `API_MESSAGES`, `buildUrl`.

## Umumiy

```ts
import { clamp, debounce, groupBy, sleep, throttle, uniqueBy } from '@akhatmirzo/core';

const save = debounce(saveDraft, 500); // save.cancel(), save.flush()
clamp(150, 0, 100); // 100
uniqueBy([{ id: 1 }, { id: 1 }, { id: 2 }], (x) => x.id); // [{ id: 1 }, { id: 2 }]
groupBy(orders, (o) => o.status); // { new: [...], paid: [...] }
await sleep(300, controller.signal); // bekor qilsa bo'ladi
```

## Hujjatlar

| Bo'lim         | Havola                                                                     |
| -------------- | -------------------------------------------------------------------------- |
| Matn           | https://toolkit.akhatmirzo.uz/uz/docs/v0.4/core/text               |
| Formatlash     | https://toolkit.akhatmirzo.uz/uz/docs/v0.4/core/format             |
| Validatsiya    | https://toolkit.akhatmirzo.uz/uz/docs/v0.4/core/validate           |
| Hujjat raqamlari | https://toolkit.akhatmirzo.uz/uz/docs/v0.4/core/identifiers |
| Zod sxemalari  | https://toolkit.akhatmirzo.uz/uz/docs/v0.4/core/zod |
| Storage va API | https://toolkit.akhatmirzo.uz/uz/docs/v0.4/core/storage-api        |
| Umumiy         | https://toolkit.akhatmirzo.uz/uz/docs/v0.4/core/utils              |

Bu paket [`@akhatmirzo/ui`](https://www.npmjs.com/package/@akhatmirzo/ui) komponentlarining
asosida turadi, lekin undan butunlay mustaqil ishlatiladi.

## Litsenziya

[MIT](https://github.com/Akhatmirzo/akhatmirzo-toolkit/blob/main/LICENSE) © Akhatmirzo

---

## English

Zero-dependency TypeScript utilities for Uzbek apps: money in so'm, `+998` phone numbers,
Uzcard/Humo card detection, Latin ↔ Cyrillic transliteration, apostrophe-insensitive search,
Uzbek dates and relative time, numbers and amounts in words (`numberToWords`, `moneyToWords`),
Uzbek date formats (`formatDateUz`, `formatDateRange`, `formatDuration`), script detection and
conversion, document identifiers (PINFL, INN/STIR, passport, car plates, bank account, MFO) with
`UZ_REGIONS`, plus a typed storage wrapper and a small `fetch` API client. No React required,
SSR-safe, tree-shakeable.

The optional `@akhatmirzo/core/zod` entry point (requires `zod` v4) exports `zUz` — ready-made
schemas with Uzbek error messages: `phone`, `pinfl`, `inn`, `passport`, `carPlate`,
`bankAccount`, `mfo`, `card`, `email`, `password`, `money` and `region`.

```ts
import { cyrToLat, formatMoney, formatPhone, numberToWords } from '@akhatmirzo/core';

formatMoney(1250000); // "1 250 000 so'm"
formatPhone('901234567'); // '+998 90 123 45 67'
cyrToLat('Ўзбекистон'); // "O'zbekiston"
numberToWords(1_250_000); // 'bir million ikki yuz ellik ming'
```

Docs: https://toolkit.akhatmirzo.uz/en/docs/v0.4/core/format
