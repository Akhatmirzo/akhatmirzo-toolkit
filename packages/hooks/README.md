# @akhatmirzo/hooks

[![npm](https://img.shields.io/npm/v/@akhatmirzo/hooks?color=4f46e5)](https://www.npmjs.com/package/@akhatmirzo/hooks)
[![npm yuklab olishlar](https://img.shields.io/npm/dm/@akhatmirzo/hooks?label=yuklab%20olishlar)](https://www.npmjs.com/package/@akhatmirzo/hooks)
[![CI](https://github.com/Akhatmirzo/akhatmirzo-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/Akhatmirzo/akhatmirzo-toolkit/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Litsenziya: MIT](https://img.shields.io/badge/litsenziya-MIT-22c55e)](https://github.com/Akhatmirzo/akhatmirzo-toolkit/blob/main/LICENSE)

**Har loyihada qayta yoziladigan React hooklar — bir marta, to'g'ri va testlar bilan.**

Hujjatlar: **https://toolkit.akhatmirzo.uz/uz/docs/v0.1/hooks**

- **Bog'liqliksiz** — faqat `react` (18+) peer bog'liqlik.
- **SSR-xavfsiz** — serverda `window` yo'qligini hisobga oladi: `useMediaQuery` va
  `useLocalStorage` server render'da standart qiymatni qaytaradi.
- **Race'dan himoyalangan** — `useAsync` eskirgan javoblarni va unmount'dan keyingi natijalarni
  e'tiborsiz qoldiradi.
- **Tree-shaking** — ESM, `sideEffects: false`.

```bash
pnpm add @akhatmirzo/hooks
```

## Hooklar

| Hook                                                      | Qaytaradi / vazifasi                                                    |
| --------------------------------------------------------- | ----------------------------------------------------------------------- |
| `useDebounce(value, ms = 300)`                            | Kechiktirilgan qiymat — qidiruv maydonlari uchun                         |
| `useDebouncedCallback(fn, ms = 300)`                      | Kechiktirilgan funksiya; `.cancel()`, `.flush()`, `.isPending()`         |
| `useToggle(initial = false)`                              | `[value, toggle, setValue]`                                              |
| `useControllableState({ value, defaultValue, onChange })` | Boshqariladigan va boshqarilmaydigan rejimni bitta API'da                |
| `useLocalStorage(key, initial)`                           | `[value, setValue, remove]` — tablar o'rtasida sinxron                   |
| `useMediaQuery(query, defaultValue = false)`              | `boolean` — masalan `'(max-width: 639px)'`                               |
| `useClickOutside(refs, handler, enabled?)`                | Bir yoki bir nechta element tashqarisiga bosilganda                      |
| `useCopyToClipboard(resetMs = 2000)`                      | `{ copied, copy(text) }`                                                 |
| `useIntersection(options?)`                               | `[ref, entry]` — cheksiz scroll va lazy yuklash                          |
| `useAsync(fn, deps?, { immediate }?)`                     | `{ status, data, error, run }`                                           |
| `usePagination({ total, pageSize, page, siblings? })`     | `{ pages, pageCount, page, hasPrev, hasNext, from, to }`                 |
| `useHotkeys(keys, handler, options?)`                     | Klaviatura qisqa yo'llari; `mod` — macOS'da ⌘, boshqalarda Ctrl          |

Yordamchilar: `getPagination` (hook'siz sof funksiya), `matchHotkey(event, keys)`,
`isApplePlatform()`.

## Misollar

### Qidiruv: debounce + qisqa yo'l + oxirgi so'rovlar

```tsx
import { useRef, useState } from 'react';
import { useDebounce, useHotkeys, useLocalStorage } from '@akhatmirzo/hooks';

export function Search() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300); // 300 ms jimlikdan keyin yangilanadi
  const [recent, setRecent] = useLocalStorage<string[]>('recent-searches', []);

  useHotkeys('mod+k', () => inputRef.current?.focus()); // ⌘K yoki Ctrl+K

  // debounced o'zgarganda so'rov yuboring ...
  return <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

### Ma'lumot yuklash va sahifalash

```tsx
import { useState } from 'react';
import { useAsync, usePagination } from '@akhatmirzo/hooks';

export function Orders() {
  const [page, setPage] = useState(5);
  const { status, data } = useAsync(() => fetchOrders(page), [page]);
  const { pages, hasNext } = usePagination({ total: 200, pageSize: 10, page });
  // pages → [1, 'ellipsis', 4, 5, 6, 'ellipsis', 20]
  // ...
}
```

### Nusxa olish

```tsx
import { useCopyToClipboard } from '@akhatmirzo/hooks';

export function CopyCode({ code }: { code: string }) {
  const { copied, copy } = useCopyToClipboard();
  return <button onClick={() => copy(code)}>{copied ? 'Nusxalandi' : 'Nusxa olish'}</button>;
}
```

Barcha hooklar, parametrlar va natijalar:
[hujjatlarda](https://toolkit.akhatmirzo.uz/uz/docs/v0.1/hooks). Komponentlar kerak
bo'lsa — [`@akhatmirzo/ui`](https://www.npmjs.com/package/@akhatmirzo/ui).

## Litsenziya

[MIT](https://github.com/Akhatmirzo/akhatmirzo-toolkit/blob/main/LICENSE) © Akhatmirzo

---

## English

Small, dependency-free React hooks (React 18+ peer only), SSR-safe and tree-shakeable:
`useDebounce`, `useDebouncedCallback`, `useToggle`, `useControllableState`, `useLocalStorage`
(synced across tabs), `useMediaQuery`, `useClickOutside`, `useCopyToClipboard`, `useIntersection`,
`useAsync` (ignores stale responses), `usePagination` and `useHotkeys` (`mod` maps to ⌘ on macOS
and Ctrl elsewhere).

```bash
pnpm add @akhatmirzo/hooks
```

Docs: https://toolkit.akhatmirzo.uz/en/docs/v0.1/hooks
