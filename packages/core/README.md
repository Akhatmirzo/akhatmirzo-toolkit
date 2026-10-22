# @akhatmirzo/core

[![npm](https://img.shields.io/npm/v/@akhatmirzo/core?color=4f46e5)](https://www.npmjs.com/package/@akhatmirzo/core)
[![npm yuklab olishlar](https://img.shields.io/npm/dm/@akhatmirzo/core?label=yuklab%20olishlar)](https://www.npmjs.com/package/@akhatmirzo/core)
[![CI](https://github.com/Akhatmirzo/akhatmirzo-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/Akhatmirzo/akhatmirzo-toolkit/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Litsenziya: MIT](https://img.shields.io/badge/litsenziya-MIT-22c55e)](https://github.com/Akhatmirzo/akhatmirzo-toolkit/blob/main/LICENSE)

**O'zbek tili va O'zbekiston formatlari uchun toza TypeScript funksiyalar: so'm, `+998`,
Uzcard/Humo, lotin ↔ kirill.**

Hujjatlar: **https://toolkit.akhatmirzo.uz/uz/docs/v0.3/core/format**

- **Bog'liqliksiz** — `dependencies` bo'sh, React ham kerak emas. Brauzerda, Node 20+ da va
  istalgan freymvorkda ishlaydi.
- **SSR-xavfsiz** — import paytida brauzer API'lariga tegmaydi; `createStorage` `localStorage` bo'lmagan muhitda ham xato bermaydi.
- **Tree-shaking** — ESM, `sideEffects: false`: faqat import qilingan funksiyalar bundle'ga
  tushadi.
- **To'liq tiplangan** — TypeScript `strict`, funksiyalar JSDoc izohlari bilan.

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
| Matn           | https://toolkit.akhatmirzo.uz/uz/docs/v0.3/core/text               |
| Formatlash     | https://toolkit.akhatmirzo.uz/uz/docs/v0.3/core/format             |
| Validatsiya    | https://toolkit.akhatmirzo.uz/uz/docs/v0.3/core/validate           |
| Storage va API | https://toolkit.akhatmirzo.uz/uz/docs/v0.3/core/storage-api        |
| Umumiy         | https://toolkit.akhatmirzo.uz/uz/docs/v0.3/core/utils              |

Bu paket [`@akhatmirzo/ui`](https://www.npmjs.com/package/@akhatmirzo/ui) komponentlarining
asosida turadi, lekin undan butunlay mustaqil ishlatiladi.

## Litsenziya

[MIT](https://github.com/Akhatmirzo/akhatmirzo-toolkit/blob/main/LICENSE) © Akhatmirzo

---

## English

Zero-dependency TypeScript utilities for Uzbek apps: money in so'm, `+998` phone numbers,
Uzcard/Humo card detection, Latin ↔ Cyrillic transliteration, apostrophe-insensitive search,
Uzbek dates and relative time, plus a typed storage wrapper and a small `fetch` API client. No
React required, SSR-safe, tree-shakeable.

```ts
import { formatMoney, formatPhone, cyrToLat } from '@akhatmirzo/core';

formatMoney(1250000); // "1 250 000 so'm"
formatPhone('901234567'); // '+998 90 123 45 67'
cyrToLat('Ўзбекистон'); // "O'zbekiston"
```

Docs: https://toolkit.akhatmirzo.uz/en/docs/v0.3/core/format
