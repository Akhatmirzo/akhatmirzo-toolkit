# 7-daraja: yangi hooklar

> Holat: ✅ tasdiqlandi (avtomatik bosqich) · Reja: `@akhatmirzo/hooks@0.2.0` (minor) — mavjud API buzilmaydi.

---

## Umumiy qoidalar (barcha hooklar)

- **SSR-xavfsiz:** render paytida `window` / `document` ga murojaat yo'q — faqat effektlarda; server qiymati aniq belgilangan (`useSyncExternalStore` yoki boshlang'ich qiymat).
- **Barqaror callback'lar:** foydalanuvchi bergan funksiya "oxirgi qiymat" ref'ida saqlanadi — har render'da qayta obuna bo'linmaydi (mavjud `useDebouncedCallback` uslubi).
- **Tozalash:** har bir listener / timer / observer unmount'da va bog'liqlik o'zgarganda tozalanadi.
- **Ref yoki element:** DOM bilan ishlovchi hooklar `RefObject<T> | T | null` qabul qiladi.
- Bog'liqliksiz, tree-shakeable; JSDoc o'zbekcha, `@example` bilan; har hook — `use-xxx.ts` + `use-xxx.test.ts(x)`.

---

## A. DOM va hodisalar

| Hook | Imzo | Izoh |
|---|---|---|
| `useEventListener` | `(target: Window \| Document \| HTMLElement \| RefObject \| null, type, handler, options?)` | Tiplangan (`WindowEventMap` / `DocumentEventMap` / `HTMLElementEventMap`); `target` default `window`; `options.enabled` |
| `useResizeObserver` | `(ref, { box? }) → { width, height } \| null` | `ResizeObserver` bo'lmasa — `null`; rAF bilan birlashtirilgan yangilanish |
| `useScrollLock` | `(locked: boolean, { target? })` | Sahifa scroll'ini qulflaydi; scrollbar kengligi `padding-right` bilan qoplanadi (layout sakramaydi); bir nechta qulf — hisoblagich (oxirgisi ochganda ochiladi); iOS uchun `overflow: hidden` + `overscroll-behavior` |
| `useFocusTrap` | `(ref, active: boolean, { initialFocus?, returnFocus? = true })` | `Tab`/`Shift+Tab` konteyner ichida aylanadi; yopilganda fokus avvalgi elementga qaytadi |
| `useLongPress` | `(callback, { delay? = 500, onStart?, onCancel?, moveThreshold? = 10 }) → handlers` | Pointer hodisalari; harakat chegarasidan oshsa bekor; `contextmenu`'ni bloklash opsiyasi |
| `useDocumentVisibility` | `() → 'visible' \| 'hidden'` | Server: `'visible'` |
| `useIsClient` | `() → boolean` | Gidratatsiyadan keyin `true` (`useSyncExternalStore`) |

## B. Vaqt va jarayon

| Hook | Imzo | Izoh |
|---|---|---|
| `useInterval` | `(callback, delay: number \| null)` | `null` → to'xtaydi |
| `useTimeout` | `(callback, delay: number \| null) → { reset, clear }` | |
| `useCountdown` | `(seconds, { autoStart? = true, onEnd? }) → { remaining, isRunning, start, pause, reset, formatted }` | `formatted` — `"0:59"`; SMS kodni qayta yuborish uchun (OtpInput bilan namuna). Vaqt `Date.now()` farqi bilan hisoblanadi (fon tabda ham to'g'ri) |
| `useIdle` | `(ms, { events?, initialState? = false }) → boolean` | Faollik hodisalari (mousemove, keydown, touchstart, scroll, visibilitychange) |
| `useStep` | `(count, { initial? = 0 }) → { step, next, prev, goTo, reset, isFirst, isLast, progress }` | `Stepper` bilan juft (docs'da namuna) |
| `useInfiniteScroll` | `({ hasMore, loading, onLoadMore, rootMargin? = '200px' }) → { sentinelRef }` | `useIntersection` ustida; yuklanayotganda qayta chaqirilmaydi |
| `usePrevious` | `(value) → T \| undefined` | |
| `useOnline` | `() → boolean` | `online`/`offline` hodisalari; server: `true` |

---

## Docs

`hooks` sahifasi (uz + en): yangi bo'limlar — **"DOM va hodisalar"** (`## Ma'lumotlar` dan oldin) va **"Vaqt va jarayon"** (oxirida). Har hook: qisqa tavsif, imzo, misol, kerak joyda jonli demo (`components/demos/hooks/`). Sahifa tavsifi (frontmatter) yangilanadi.

## Bajarish

| Agent | Ish |
|---|---|
| A | §A — 7 hook, testlar, docs bo'limi, playground (`hooks.tsx` sahifasida bo'lim) |
| B | §B — 8 hook, testlar, docs bo'limi, playground bo'limi |
| Nazoratchi | qoidalar (SSR, tozalash, barqaror callback), testlar, docs; `@akhatmirzo/ui` ichida shu hooklar bilan almashtirsa bo'ladigan takroriy kodlar ro'yxati (o'zgartirmasdan) |

**Tayyor mezoni:** hook + testlar (fake timers, SSR `renderToString`) · docs uz + en · typecheck, lint, format, test, build · lockfile o'zgarmaydi.
