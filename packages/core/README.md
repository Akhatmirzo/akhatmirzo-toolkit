# @akhatmirzo/core

O'zbek tili va O'zbekiston formatlariga moslangan, **bog'liqliksiz** TypeScript yordamchi funksiyalar. React'siz, SSR-xavfsiz.

```bash
pnpm add @akhatmirzo/core
```

## Matn

```ts
import { normalizeUz, cyrToLat, latToCyr, searchMatch, fuzzyMatch, slugify, truncateMiddle } from '@akhatmirzo/core';

normalizeUz("Gʻuzor");            // 'guzor' — ʻ ' ‘ ’ va kirill bir xil kalitga keladi
cyrToLat('Шаҳар');                 // 'Shahar'
latToCyr("O'zbekiston");           // 'Ўзбекистон'
searchMatch('Toshkent', 'тош');    // { match: true, ranges: [[0, 4]] } — 'тош' → 'tosh', o'rinlar asl matnda
fuzzyMatch('Yangi buyurtma', 'ybuy'); // { score, ranges } | null
slugify("Farg'ona viloyati");      // 'fargona-viloyati'
truncateMiddle('hisobot-oktabr-2026.pdf', 22); // 'hisobot-oktab…2026.pdf'
```

Shuningdek: `splitByRanges` (topilgan qismni ajratib chizish uchun), `truncate`, `capitalize`, `isApostrophe`, `UZ_APOSTROPHES`.

## Formatlash

```ts
import { formatMoney, formatPhone, formatCardNumber, formatDate, parseDate, timeAgo, formatFileSize } from '@akhatmirzo/core';

formatMoney(1250000);                  // "1 250 000 so'm"
formatPhone('901234567');              // '+998 90 123 45 67'
formatPhone('901234567', 'national');  // '(90) 123-45-67'
formatCardNumber('8600123412341234');  // '8600 1234 1234 1234'
formatDate(new Date(2026, 9, 21), 'd MMMM yyyy, EEEE'); // '21 Oktabr 2026, Chorshanba'
parseDate('31.02.2026');               // null — mavjud bo'lmagan sana
timeAgo(fiveMinutesAgo);               // '5 daqiqa oldin'
formatFileSize(3_400_000);             // '3.2 MB'
```

Konstantalar: `MONTHS_UZ`, `MONTHS_UZ_SHORT`, `WEEKDAYS_UZ`, `WEEKDAYS_UZ_SHORT` (hafta dushanbadan), `weekdayIndex`. Shuningdek `formatNumber`.

## Validatsiya

```ts
import { parsePhone, isValidPhone, isValidCardNumber, detectCardBrand, isValidEmail, passwordStrength } from '@akhatmirzo/core';

parsePhone('+998 90 123-45-67'); // { digits: '901234567', operator: '90', valid: true }
detectCardBrand('9860…');        // 'humo' | 'uzcard' | 'visa' | 'mastercard' | null
isValidCardNumber('4111 1111 1111 1111'); // true (Luhn)
passwordStrength('Parol123!');   // { score: 3, label: 'Yaxshi', checks: {...} }
```

Shuningdek: `isValidEmail`, `luhnCheck`, `UZ_OPERATOR_CODES`.

## Storage va API

```ts
import { createStorage, createApiClient, isApiError } from '@akhatmirzo/core';

const storage = createStorage({ prefix: 'app:' });
storage.set('token', 'abc', { ttl: 60 * 60 * 1000 }); // 1 soatdan keyin o'chadi
storage.get<string>('token');

const api = createApiClient({ baseUrl: '/api', getToken: () => storage.get('token') });
try {
  const orders = await api.get<Order[]>('/orders', { query: { page: 1 } });
} catch (e) {
  if (isApiError(e)) console.log(e.code, e.status, e.message); // 'TIMEOUT' | 'NETWORK' | 'HTTP' ...
}
```

Shuningdek: `createMemoryStorage`, `ApiError`, `API_MESSAGES`, `httpErrorMessage`, `buildUrl`.

## Umumiy

`debounce` (`.cancel()`, `.flush()`), `throttle`, `sleep(ms, signal?)`, `groupBy`, `uniqueBy`, `clamp`.

## Litsenziya

MIT
