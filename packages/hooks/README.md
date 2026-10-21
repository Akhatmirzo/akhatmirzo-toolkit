# @akhatmirzo/hooks

Qayta ishlatiladigan React hooklar. Bog'liqliksiz (faqat `react` peer), SSR-xavfsiz.

```bash
pnpm add @akhatmirzo/hooks
```

| Hook | Vazifasi |
|---|---|
| `useDebounce(value, ms)` | Qiymatni kechiktiradi (qidiruv maydoni) |
| `useDebouncedCallback(fn, ms)` | Funksiyani kechiktiradi; `.cancel()`, `.flush()` |
| `useToggle(initial)` | `[value, toggle, setValue]` |
| `useControllableState({ value, defaultValue, onChange })` | Boshqariladigan / boshqarilmaydigan komponentlar uchun |
| `useLocalStorage(key, initial)` | `[value, set, remove]` — tablar o'rtasida sinxron |
| `useMediaQuery(query)` | `'(max-width: 639px)'` kabi so'rov natijasi |
| `useClickOutside(ref, handler)` | Element tashqarisiga bosish |
| `useCopyToClipboard(resetMs)` | `{ copied, copy(text) }` |
| `useIntersection(options)` | `[ref, entry]` — cheksiz scroll uchun |
| `useAsync(fn, deps)` | `{ status, data, error, run }` — eskirgan javoblar e'tiborsiz |
| `usePagination({ total, pageSize, page })` | `{ pages: [1, 'ellipsis', 4, 5, 6, …], hasNext, … }` |
| `useHotkeys('mod+k', handler)` | Klaviatura qisqa yo'llari (`mod` — macOS'da ⌘, boshqalarda Ctrl) |

```tsx
import { useDebounce, useHotkeys, useLocalStorage } from '@akhatmirzo/hooks';

function Search() {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const [recent, setRecent] = useLocalStorage<string[]>('recent', []);
  useHotkeys('mod+k', () => inputRef.current?.focus());
  // ...
}
```

Yordamchilar: `getPagination`, `matchHotkey`, `isApplePlatform`.

## Litsenziya

MIT
