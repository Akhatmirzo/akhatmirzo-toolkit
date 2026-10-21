# Dizayn tizimi

> Holat: **✅ 1-bosqich — UI/UX dizayn yakunlandi** · Oxirgi yangilanish: 2026-10-21
> Prototip: [prototype/index.html](prototype/index.html) · Spetsifikatsiyalar: [specs/](specs/)

---

## 1. Dizayn yo'nalishi — ✅ tanlandi

**B. Yumshoq va do'stona**

| Xususiyat | Qaror |
|---|---|
| Kayfiyat | Do'stona, yengil, ochiq — lekin professional |
| Ilhom | Stripe, Notion |
| Aksent | Indigo |
| Shakllar | Katta radius (tugma/input ~12px, karta ~14–16px), badge'lar pill |
| Fonlar | Yumshoq, sovuq-neytral (slate) |
| Ikkilamchi tugma | Chegarali emas, **yumshoq to'ldirilgan** (`primary-soft`) |

---

## 2. Rang palitrasi — ✅ tasdiqlandi

### 2.1 Bazaviy shkalalar

**Primary — indigo**
| 50 | 100 | 200 | 300 | 400 | 500 | **600** | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#EEF2FF` | `#E0E7FF` | `#C7D2FE` | `#A5B4FC` | `#818CF8` | `#6366F1` | **`#4F46E5`** | `#4338CA` | `#3730A3` | `#312E81` | `#1E1B4B` |

**Neutral — slate**
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#F8FAFC` | `#F1F5F9` | `#E2E8F0` | `#CBD5E1` | `#94A3B8` | `#64748B` | `#475569` | `#334155` | `#1E293B` | `#0F172A` | `#020617` |

**Semantik**
| Rol | Rang | 50 | 100 | 500 | 600 | 700 |
|---|---|---|---|---|---|---|
| Success | emerald | `#ECFDF5` | `#D1FAE5` | `#10B981` | `#059669` | `#047857` |
| Warning | amber | `#FFFBEB` | `#FEF3C7` | `#F59E0B` | `#D97706` | `#B45309` |
| Danger | rose | `#FFF1F2` | `#FFE4E6` | `#F43F5E` | `#E11D48` | `#BE123C` |
| Info | sky | `#F0F9FF` | `#E0F2FE` | `#0EA5E9` | `#0284C7` | `#0369A1` |

### 2.2 Semantik tokenlar (komponentlar faqat shularni ishlatadi)

> Qoida: komponent hech qachon `indigo-600` ni to'g'ridan-to'g'ri ishlatmaydi — faqat `--color-primary`.
> Shunda dark mode va loyiha bo'yicha brend almashtirish bitta joyda bo'ladi.

| Token | Light | Dark | Ishlatilishi |
|---|---|---|---|
| `--color-background` | slate-50 `#F8FAFC` | slate-900 `#0F172A` | Sahifa foni |
| `--color-surface` | `#FFFFFF` | slate-800 `#1E293B` | Karta, modal, input foni |
| `--color-surface-muted` | slate-100 `#F1F5F9` | slate-700 `#334155` | Hover, ikkilamchi fon |
| `--color-border` | slate-200 `#E2E8F0` | slate-700 `#334155` | Oddiy chegara |
| `--color-border-strong` | slate-300 `#CBD5E1` | slate-600 `#475569` | Hover chegara |
| `--color-text` | slate-900 `#0F172A` | slate-100 `#F1F5F9` | Asosiy matn |
| `--color-text-muted` | slate-500 `#64748B` | slate-400 `#94A3B8` | Yordamchi matn, placeholder |
| `--color-primary` | indigo-600 `#4F46E5` | indigo-600 `#4F46E5` | Asosiy tugma foni |
| `--color-primary-hover` | indigo-700 `#4338CA` | indigo-500 `#6366F1` | Asosiy tugma hover |
| `--color-primary-foreground` | `#FFFFFF` | `#FFFFFF` | Asosiy tugma matni |
| `--color-primary-soft` | indigo-50 `#EEF2FF` | indigo-950 `#1E1B4B` | Ikkilamchi tugma, badge foni |
| `--color-primary-soft-foreground` | indigo-700 `#4338CA` | indigo-300 `#A5B4FC` | Ikkilamchi tugma matni |
| `--color-ring` | indigo-500 / 40% | indigo-400 / 50% | Focus ring |
| `--color-success-soft` / `-foreground` | `#ECFDF5` / `#047857` | `#022C22` / `#6EE7B7` | Status badge |
| `--color-warning-soft` / `-foreground` | `#FFFBEB` / `#B45309` | `#451A03` / `#FCD34D` | Status badge |
| `--color-danger-soft` / `-foreground` | `#FFF1F2` / `#BE123C` | `#4C0519` / `#FDA4AF` | Status badge, xato |
| `--color-info-soft` / `-foreground` | `#F0F9FF` / `#0369A1` | `#082F49` / `#7DD3FC` | Status badge |
| `--color-danger` | rose-600 `#E11D48` | rose-500 `#F43F5E` | Xavfli tugma (o'chirish) |

### 2.3 Kontrast (WCAG AA ≥ 4.5:1)
| Juftlik | Nisbat | Holat |
|---|---|---|
| Oq matn / indigo-600 | ~6.3:1 | ✅ |
| slate-500 / oq fon | ~4.8:1 | ✅ |
| slate-900 / slate-50 | ~17:1 | ✅ |
| indigo-700 / indigo-50 | ~7.4:1 | ✅ |
| slate-400 / slate-800 (dark muted) | ~5.7:1 | ✅ |

> Dark mode'da primary tugma ataylab indigo-600 qoldirildi: indigo-500 oq matn bilan AA chegarasidan biroz pastda (~4.5).

---

## 3. Tipografiya — ✅ tanlandi

### 3.1 Shriftlar
| Rol | Shrift | Manba | Eslatma |
|---|---|---|---|
| Asosiy (UI + matn) | **Manrope** | Google Fonts / `@fontsource-variable/manrope` | Lotin + kirill, variable font |
| Monospace (kod) | **JetBrains Mono** | Google Fonts / `@fontsource-variable/jetbrains-mono` | Kod bloklari, texnik qiymatlar |
| Fallback | `ui-sans-serif, system-ui, sans-serif` | — | Shrift yuklanguncha |

- Raqamlar: jadval, narx, statistika — `font-variant-numeric: tabular-nums`
- O'zbek apostrofi: `ʻ` (U+02BB) va `'` ikkalasi ham to'g'ri ko'rinishi tekshirildi

### 3.2 O'lchamlar shkalasi
| Token | O'lcham / qator | Qalinlik | Letter-spacing | Ishlatilishi |
|---|---|---|---|---|
| `text-xs` | 12 / 16 | 500 | 0 | Badge, yordamchi izoh |
| `text-sm` | 14 / 20 | 400–500 | 0 | **UI standarti**: tugma, input, jadval |
| `text-base` | 16 / 24 | 400 | 0 | Asosiy matn |
| `text-lg` | 18 / 28 | 500 | 0 | Karta sarlavhasi |
| `text-xl` | 20 / 28 | 600 | -0.01em | Modal sarlavhasi |
| `text-2xl` | 24 / 32 | 600 | -0.01em | Bo'lim sarlavhasi |
| `text-3xl` | 30 / 36 | 700 | -0.02em | Sahifa sarlavhasi |
| `text-4xl` | 36 / 40 | 700 | -0.02em | Katta sarlavha |

### 3.3 Qalinliklar
`400` oddiy · `500` o'rta (tugma, label) · `600` yarim qalin (sarlavha) · `700` qalin (katta sarlavha)

---

## 4. Spacing, radius, soyalar — ✅ tasdiqlandi

### 4.1 Spacing — 4px asos (Tailwind standarti bilan bir xil)
| Token | px | Ishlatilishi |
|---|---|---|
| `1` | 4 | Ikonka va matn orasi |
| `2` | 8 | Badge ichi, kichik oraliq |
| `3` | 12 | Input ichki chetlari |
| `4` | 16 | Tugma ichi, elementlar orasi |
| `6` | 24 | Karta ichki chetlari |
| `8` | 32 | Bo'limlar orasi |
| `12` | 48 | Katta bloklar orasi |
| `16` | 64 | Sahifa seksiyalari |

> Qoida: faqat shkaladagi qiymatlar. `13px`, `22px` kabi "tasodifiy" qiymatlar ishlatilmaydi.

### 4.2 Radius
| Token | px | Ishlatilishi |
|---|---|---|
| `--radius-sm` | 6 | Checkbox, kichik elementlar |
| `--radius-md` | 8 | Tooltip, menyu elementi |
| `--radius-lg` | 12 | **Tugma, input, select** |
| `--radius-xl` | 16 | Karta, popover, dropdown |
| `--radius-2xl` | 20 | Modal, drawer |
| `--radius-full` | 9999 | Badge, avatar, switch |

> Qoida: ichma-ich elementlarda ichki radius = tashqi radius − padding (masalan, 16px karta ichida 8px padding bilan → 8px).

### 4.3 Soyalar
Soya rangi qora emas, **slate-900** (`rgb(15 23 42)`) — yumshoqroq ko'rinadi.

| Token | Light | Ishlatilishi |
|---|---|---|
| `--shadow-xs` | `0 1px 2px rgb(15 23 42 / .05)` | Input, tugma |
| `--shadow-sm` | `0 1px 3px rgb(15 23 42 / .06), 0 1px 2px rgb(15 23 42 / .04)` | Karta |
| `--shadow-md` | `0 4px 12px -2px rgb(15 23 42 / .08), 0 2px 4px -2px rgb(15 23 42 / .04)` | Dropdown, select menyusi |
| `--shadow-lg` | `0 12px 24px -6px rgb(15 23 42 / .10), 0 4px 8px -4px rgb(15 23 42 / .05)` | Popover, toast |
| `--shadow-xl` | `0 24px 48px -12px rgb(15 23 42 / .18)` | Modal, drawer |

**Dark mode:** soyalar qorong'i fonda deyarli ko'rinmaydi, shuning uchun balandlik **1px chegara halqasi + ochroq fon** bilan ko'rsatiladi:
- `xs–md`: `0 0 0 1px slate-700` + qora soya (30–40%), fon `slate-800`
- `lg–xl`: `0 0 0 1px slate-600` + qora soya (45–55%), fon bir pog'ona ochroq (`#273449`)

---

## 5. Animatsiya — ✅ tasdiqlandi

### 5.1 Tamoyillar
1. **Animatsiya — ma'lumot, bezak emas.** U narsa qayerdan kelganini va qayerga ketganini ko'rsatadi.
2. **Tez.** UI animatsiyalari 100–300ms. Foydalanuvchi kutib qolmasligi kerak.
3. **Kirish sekinroq, chiqish tezroq.** Ochilish ~200ms, yopilish ~150ms.
4. **Kirish — ease-out, chiqish — ease-in.** Kirgan narsa sekinlashib to'xtaydi; chiqqan narsa tezlashib ketadi.
5. **Faqat `transform` va `opacity`.** `width`, `height`, `top` animatsiyasi sekin (layout qayta hisoblanadi).
6. **Kichik masofalar.** Element 4–16px siljiydi, `scale` 0.95–1 oralig'ida. Katta "uchishlar" yo'q.
7. **`prefers-reduced-motion`.** Yoqilgan bo'lsa — siljish va scale o'chadi, faqat qisqa opacity (≤100ms) qoladi.

### 5.2 Davomiylik tokenlari
| Token | ms | Ishlatilishi |
|---|---|---|
| `--duration-fast` | 100 | Hover, press, dropdown yopilishi |
| `--duration-base` | 150 | Dropdown ochilishi, tooltip, modal yopilishi |
| `--duration-moderate` | 200 | Modal ochilishi, accordion, tabs |
| `--duration-slow` | 300 | Drawer, toast kirishi |

### 5.3 Easing tokenlari
| Token | Qiymat | Ishlatilishi |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | **Asosiy** — barcha kirishlar |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Chiqishlar |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Joyida o'zgarish (tab indikatori, accordion) |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Kamdan-kam: toast, switch tugmachasi, muvaffaqiyat belgisi |

> `linear` faqat spinner va progress uchun.

### 5.4 Komponentlar bo'yicha
| Komponent | Kirish | Chiqish |
|---|---|---|
| Button | hover: rang 150ms · press: `scale(0.97)` 100ms | — |
| Tooltip | opacity + `translateY(2px→0)`, 150ms, 300ms kechikish bilan | opacity 100ms |
| Dropdown / Select / Popover | opacity + `scale(0.98→1)` + `translateY(-4px→0)`, 150ms, origin trigger tomonda | 100ms ease-in |
| Modal | overlay opacity + panel `scale(0.95→1)`, 200ms | 150ms ease-in |
| Drawer | `translateX(100%→0)`, 300ms | 200ms ease-in |
| Toast | `translateY(16px→0)`, 300ms spring | opacity + siljish 200ms |
| Accordion | balandlik (Radix CSS var orqali) 200ms ease-in-out | 200ms |
| Tabs indikatori | siljish 200ms ease-in-out | — |
| Switch | tugmacha 150ms spring | — |
| Skeleton | shimmer 1.5s linear, cheksiz | — |

---

## 6. Z-index qatlamlari

| Token | Qiymat | Kim |
|---|---|---|
| `--z-dropdown` | 1000 | Dropdown, Select, Combobox, Popover, DatePicker |
| `--z-overlay` | 1100 | Dialog / Drawer / Command Palette foni |
| `--z-modal` | 1110 | Dialog, Drawer, Command Palette paneli |
| `--z-toast` | 1200 | Toast |
| `--z-tooltip` | 1300 | Tooltip |

---

## 7. Dizayn bosqichi — ✅ yakunlandi

- [x] Dizayn yo'nalishi
- [x] Rang palitrasi
- [x] Tipografiya
- [x] Spacing, radius, soya shkalalari
- [x] Animatsiya tamoyillari
- [x] Komponent spetsifikatsiyalari — `specs/` papkasida
  - [x] Umumiy qoidalar (`specs/00-conventions.md`)
  - [x] 1-daraja (`specs/01-basic.md`) + prototip `prototype/tier1.html`
  - [x] 2-daraja (`specs/02-interactive.md`) + prototip `prototype/tier2.html`
  - [x] 3-daraja (`specs/03-advanced.md`) + prototip `prototype/tier3.html`
- [x] Vizual prototip — `prototype/index.html` (bosh sahifa)

### Prototipdan kod bosqichiga o'tadigan saboqlar
1. **Global stillardan himoya** — komponent fon, rang, chegara va shriftni doim aniq belgilaydi (ilovaning `button {}` stillari prototipni buzgan edi)
2. **Hardcode rang yo'q** — dark mode'da och qolgan badge/avatarlar shuni ko'rsatdi; har bir rang semantik token orqali
3. **Fokus bitta joyda** — input o'z halqasini o'chiradi, konteyner ko'rsatadi
4. **Dialog balandligi** — `max-height: 100dvh − 32px` + ichki scroll
5. **Dastlabki fokus** — Dialog'da birinchi input'ga (yopish ✕ ga emas); xavfli tasdiqlashda — "Bekor qilish" ga
6. **O'zbek matn qidiruvi** — `ʻ ' ‘ '` bir xil, kirill ↔ lotin; Combobox, DataTable va Command Palette uchun **bitta** `core` funksiyasi (`normalizeUz`)
