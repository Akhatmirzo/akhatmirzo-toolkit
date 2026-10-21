# Shaxsiy Frontend Kutubxona — Umumiy Reja

> Holat: **✅ 0–7-bosqichlar tayyor (32 komponent) → keyingisi: 8-bosqich, nashr va hujjat** · Oxirgi yangilanish: 2026-10-21
> Dizayn: [DESIGN.md](DESIGN.md) · Spetsifikatsiyalar: [specs/](specs/) · Prototip: [prototype/index.html](prototype/index.html)

---

## 1. Maqsad

Har bir yangi loyihada bir xil kodni qayta yozmaslik uchun **shaxsiy, qayta ishlatiladigan frontend toolkit** yaratish:
yordamchi funksiyalar, React hooklar, dizayn tizimi va kuchli UX'ga ega UI komponentlar.

- **Kim uchun:** o'zim (shaxsiy loyihalar)
- **Platforma:** Web (React). React Native — kelajak rejasi (9-bo'lim)
- **Tamoyil:** sifat > miqdor. Kam, lekin puxta komponentlar.

---

## 2. Qabul qilingan qarorlar

| Mavzu | Qaror | Sabab |
|---|---|---|
| Platforma | Faqat Web (React) | Diqqatni bir joyga jamlash; RN keyinroq |
| Til | TypeScript | Tiplar = avtomatik hujjat va xatolardan himoya |
| Tuzilma | Monorepo (pnpm workspaces) | Barcha paketlar bir joyda, bir-birini ko'radi |
| Yondashuv | **Gibrid** | Behavior — tayyor kutubxonadan, ko'rinish va API — o'zimizniki |
| Stil | **Tailwind CSS v4** | Tezlik, Radix/shadcn ekotizimi bilan mos |
| Tokenlar | CSS variables + Tailwind `@theme` | Stil vositasiga bog'lanib qolmaydi |
| Variantlar | `cva` + `tailwind-merge` (`cn()` helper) | Toza variant API, klass konfliktlarisiz |
| Murakkab behavior | Radix UI | Fokus, klaviatura, ARIA — tayyor va sinalgan |
| Jadval / ro'yxat | TanStack Table, TanStack Virtual | Headless, kuchli |
| Sana | react-day-picker + date-fns (`uz` locale) | Kalendar accessibility'si tayyor, o'zbek tili bor |
| Qidiruvli ro'yxatlar | cmdk | Combobox va Command Palette uchun bitta asos |
| Dizayn yo'nalishi | Yumshoq va do'stona (indigo + slate) | Batafsil: DESIGN.md |
| Shrift | Manrope + JetBrains Mono | Lotin + kirill, iliq geometrik |
| Build | tsup | Oddiy, kam sozlama |
| Test | Vitest + Testing Library | Tez, zamonaviy |
| Versiyalash | Changesets + SemVer | Avtomatik versiya va CHANGELOG |

### Oltin qoida
> **Behavior'ni tayyor kutubxonadan olamiz, ko'rinish va API'ni o'zimiz yasaymiz.**
> Foydalanuvchi faqat `<Select />` ni ko'radi — ichida Radix borligini bilmaydi.

---

## 3. Paketlar tarkibi

```
my-toolkit/
├── packages/
│   ├── core/       ← toza TS funksiyalar (React'siz, 0 bog'liqlik)
│   ├── hooks/      ← React hooklar (0 bog'liqlik)
│   ├── tokens/     ← dizayn qiymatlari (CSS variables)
│   └── ui/         ← komponentlar (Tailwind + Radix)
├── apps/
│   └── playground/ ← Vite + React: komponentlarni jonli sinash
└── package.json
```

### 3.1 `core` — yordamchi funksiyalar (0 dan)
| Guruh | Funksiyalar |
|---|---|
| Formatlash | `formatMoney`, `formatPhone`, `formatDate`, `timeAgo`, `formatFileSize` |
| Validatsiya | telefon (+998), email, karta raqami (Luhn), parol kuchliligi |
| Matn | `slugify`, `truncate`, `capitalize`, kirill ↔ lotin |
| Umumiy | `debounce`, `throttle`, `sleep`, `groupBy`, `uniqueBy`, `clamp` |
| Storage | `localStorage` wrapper (JSON + muddat) |
| API | `fetch` wrapper: base URL, token, timeout, yagona xato formati |

### 3.2 `hooks` — React hooklar (0 dan)
`useDebounce`, `useToggle`, `useLocalStorage`, `useMediaQuery`, `useClickOutside`,
`useCopyToClipboard`, `useIntersection`, `useAsync`, `usePagination`, `useHotkeys`

### 3.3 `tokens` — dizayn tizimi
Ranglar (light + dark), tipografiya, spacing, radius, soyalar, animatsiya (tezlik + easing), breakpoint'lar, z-index qatlamlari.

### 3.4 `ui` — komponentlar

**1-daraja: asosiy** — *0 dan*
Button, IconButton, Input, Textarea, Field, Checkbox, Radio, Switch, Badge, Avatar, Card, Spinner, Skeleton, Divider, Kbd

**2-daraja: interaktiv** — *Radix + o'z dizaynimiz*
Dialog (Modal), Drawer, Dropdown Menu, Select, Combobox, Tooltip, Popover, Tabs, Accordion, Toast

**3-daraja: murakkab** — *aralash*
| Komponent | Asos |
|---|---|
| DataTable (saralash, filtr, sahifalash) | TanStack Table |
| Virtual List | TanStack Virtual |
| DatePicker / DateRangePicker | react-day-picker + date-fns |
| Command Palette (`Ctrl+K`) | cmdk + Dialog |
| FileUpload (drag-drop, progress, preview) | 0 dan |
| Masked Input (telefon, pul, karta) | 0 dan |
| OTP Input | 0 dan |

---

## 4. "Kuchli UX" standarti

Har bir interaktiv komponent quyidagilarga javob berishi **shart**:

- [ ] ⌨️ **Klaviatura** — to'liq boshqaruv (Tab, ↑↓, Enter, Esc)
- [ ] 🎯 **Fokus** — ko'rinadigan focus ring, focus trap, yopilganda fokus qaytishi
- [ ] ♿ **ARIA** — to'g'ri rollar va atributlar
- [ ] 📍 **Joylashuv** — ekran chetida avtomatik moslashish
- [ ] ⏳ **Holatlar** — default, hover, active, focus, disabled, loading, error, empty
- [ ] ✨ **Animatsiya** — silliq, `prefers-reduced-motion` ni hurmat qiladi
- [ ] 📱 **Responsive** — telefonda ham qulay (touch target ≥ 44px)
- [ ] 🌗 **Dark mode** — tokenlar orqali

---

## 5. Bosqichlar (yo'l xaritasi)

### ✅ 0-bosqich: Rejalashtirish
- [x] Maqsad va auditoriya
- [x] Platforma, stil, yondashuv qarorlari
- [x] Paketlar tarkibi
- [x] Umumiy reja (shu hujjat)

### ✅ 1-bosqich: UI/UX dizayn
- [x] **Dizayn yo'nalishi** — yumshoq va do'stona
- [x] **Rang palitrasi** — indigo + slate, semantik ranglar, light + dark
- [x] **Tipografiya** — Manrope, 8 pog'onali shkala
- [x] **Spacing, radius, soya** shkalalari
- [x] **Animatsiya tamoyillari** — davomiylik va easing tokenlari, komponentlar jadvali
- [x] **Komponent spetsifikatsiyalari** — `specs/` (umumiy qoidalar + 3 daraja, 32 komponent)
- [x] **Vizual prototip** — `prototype/` (bosh sahifa + 3 ta interaktiv sahifa)

*Natija:* `DESIGN.md`, `specs/`, `prototype/`

### ✅ 2-bosqich: Loyiha infratuzilmasi
- [x] Monorepo (pnpm workspaces), TypeScript 6.0, ESLint 10, Prettier
- [x] tsup build, Vitest 5 (projects), Changesets 3
- [x] Playground ilova (Vite 8 + React 19 + Tailwind v4.3) — paketlar `source` sharti orqali `src` dan
- [x] Git repo (lokal)
- [ ] GitHub — `gh auth login` qilingach ulanadi

*Eslatma:* Turborepo qo'shilmadi — 4 ta paketda `pnpm -r` yetarli; build sekinlashsa qo'shiladi.

### 🔀 Bajarish tartibi o'zgartirildi (2026-10-21)
Komponentlarni ertaroq ko'rish uchun: **4 → 5 → 3 → 6 → 7**.
1-darajadagi komponentlarga faqat tokenlar va `cn()` kerak; `core`/`hooks` funksiyalari esa ularni ishlatadigan 2–3-daraja komponentlaridan oldin, aniq ehtiyoj bilan yoziladi.

### ✅ 3-bosqich: `core` + `hooks`
- [x] `core`: matn (normalizeUz, kirill↔lotin, searchMatch, fuzzyMatch, slugify, truncate), formatlash (pul, telefon, karta, sana, timeAgo, fayl hajmi), validatsiya (telefon, email, karta, parol), utils, storage, api mijozi + testlar
- [x] `hooks`: useDebounce, useControllableState, useLocalStorage, useMediaQuery, useClickOutside, useCopyToClipboard, useIntersection, useAsync, usePagination, useHotkeys + testlar
- [x] Playground: "Funksiyalar" bo'limi (Matn, Formatlash, Validatsiya, Hooklar)

### ✅ 4-bosqich: `tokens`
- [x] Dizayndagi qiymatlarni CSS variables'ga o'tkazish
- [x] Tailwind `@theme` integratsiyasi, dark mode, `focus-ring` utilitalari

### ✅ 5-bosqich: `ui` — 1-daraja
- [x] `cn()` helper, `cva` asoslari
- [x] 15 ta komponent + playground'da namoyish

### ✅ 6-bosqich: `ui` — 2-daraja
- [x] Radix asosidagi 10 ta komponent: Dialog (+ confirm()), Drawer, Popover, Tooltip, Toast, DropdownMenu, Select, Combobox, Tabs, Accordion
- [x] Umumiy overlay animatsiyalari (tokens) va panel stillari (lib/overlay-styles.ts)
- [x] Modal ichidagi panellar modal qatlamida ochiladi (lib/modal-layer.ts)
- [x] Playground: "Overlay" va "Navigatsiya" bo'limlari; provider'lar ilova ildizida

### ✅ 7-bosqich: `ui` — 3-daraja
- [x] DataTable (TanStack Table v9), VirtualList (TanStack Virtual)
- [x] Calendar, DatePicker, DateRangePicker (react-day-picker v10, o'zbekcha)
- [x] MaskedInput, PhoneInput, MoneyInput, CardInput, OtpInput (+ ResendTimer), FileUpload
- [x] CommandPalette (Ctrl+K)
- [x] Playground: "Ma'lumotlar" bo'limi

### 📦 8-bosqich: Nashr va hujjat  ← **JARAYONDA**
- [x] Qarorlar: npm public, GitHub public, MIT, birinchi versiya 0.1.0
- [x] Paket metama'lumotlari, LICENSE, har bir paket uchun README, CHANGELOG (Changesets)
- [x] CI: GitHub Actions (`pnpm check` + playground build)
- [x] Qadoqlar (`pnpm pack`) alohida Vite ilovaga o'rnatilib sinaldi: tsc (skipLibCheck: false), build, brauzerda stillar, toast, confirm
- [x] GitHub'ga yuborildi: https://github.com/Akhatmirzo/akhatmirzo-toolkit (public)
- [ ] npm'ga nashr — 2FA kodi bilan foydalanuvchi o'zi: `pnpm build` + `pnpm changeset publish --otp=KOD`
- [ ] Birinchi haqiqiy loyihada sinab ko'rish

---

## 6. "Tayyor" mezoni (Definition of Done)

Har bir funksiya / komponent quyidagilarsiz tayyor hisoblanmaydi:
1. TypeScript tiplari to'liq
2. Testlar yozilgan
3. Playground'da namoyish qilingan
4. (UI uchun) UX standarti — 4-bo'lim — bajarilgan
5. Qisqa ishlatish misoli bor

---

## 7. Xavflar va ehtiyot choralari

| Xavf | Chora |
|---|---|
| Ko'lam haddan oshib ketishi | Bosqichma-bosqich; har bosqich tugamaguncha keyingisiga o'tmaslik |
| Komponentlarni haddan ortiq murakkablashtirish | Avval eng ko'p ishlatiladigan holat, keyin kengaytirish |
| Tailwind `@source` unutilishi | README'da ulanish yo'riqnomasi |
| Bog'liqliklar eskirishi | Faqat zarur bog'liqliklar; `core` va `hooks` — 0 bog'liqlik |

---

## 8. Ochiq savollar (keyinroq hal qilinadi)

- npm'da public yoki private — **8-bosqichda** hal qilinadi (infratuzilma ikkalasiga mos quriladi)
- ~~Paketlar nomi / scope~~ → **`@akhatmirzo`** (2-bosqich boshida hal qilindi)
- ~~Hujjat sayti~~ → **Playground** (Vite + React); Storybook kerak bo'lsa keyin qo'shiladi
- ~~DatePicker uchun asos~~ → `react-day-picker` (dizayn bosqichida hal qilindi)

### 2-bosqich oldidan qarorlar
| Mavzu | Qaror |
|---|---|
| Scope | `@akhatmirzo/core`, `@akhatmirzo/hooks`, `@akhatmirzo/tokens`, `@akhatmirzo/ui` |
| Muhit | Node 22, pnpm 9 |
| Git | Lokal git hozir; GitHub — `gh auth login` qilingach ulanadi |
| npm | Publish oldidan `npm login` va `@akhatmirzo` scope egaligini tekshirish |

---

## 9. Kelajak rejasi

- **React Native** — `ui-native` paketi; `core`, `hooks`, `tokens` qayta ishlatiladi
- Formalar integratsiyasi (react-hook-form + zod)
- Chart komponentlari
- `TimePicker`, `HoverCard`, rasm kesish (crop) — dizayn bosqichida keyinga qoldirildi
