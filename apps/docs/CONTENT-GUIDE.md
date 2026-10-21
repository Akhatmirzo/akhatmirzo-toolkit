# Kontent yozish yo'riqnomasi (docs)

Bu hujjat — `apps/docs` ga sahifa yozadigan har bir odam (yoki agent) uchun yagona qoidalar
to'plami. Etalon sahifalar: `content/docs/v0.1/installation.mdx` va
`content/docs/v0.1/components/button.mdx` (+ `.en.mdx`). Yangi sahifani yozishdan oldin
ularni oching va tuzilishini takrorlang.

## 1. Fayllar qayerda

```
apps/docs/content/docs/
  meta.json                 # versiyalar ro'yxati: { "pages": ["v0.1"] } — TEGMANG (skript yangilaydi)
  v0.1/                     # versiya papkasi (root folder → sidebar'dagi versiya tanlagich)
    meta.json               # o'zbekcha sidebar: tartib + bo'lim sarlavhalari
    meta.en.json            # inglizcha sidebar (xuddi shu tartib, inglizcha sarlavhalar)
    introduction.mdx        # o'zbekcha (asosiy til)
    introduction.en.mdx     # inglizcha
    components/button.mdx
    components/button.en.mdx
    core/format.mdx ...
    hooks.mdx
```

- **Ikki til, "dot" konvensiyasi:** `nom.mdx` — o'zbekcha, `nom.en.mdx` — inglizcha, bir papkada
  yonma-yon. Inglizcha fayl bo'lmasa, `/en/...` sahifasida o'zbekcha matn ko'rsatiladi —
  shuning uchun **har doim ikkala faylni yozing**.
- **Faqat eng so'nggi versiya papkasini tahrirlang** (`lib/versions.json` dagi `latest`, hozir
  `v0.1`). Eski versiya papkalari — tarix, faqat xato tuzatish uchun.
- URL: `/<til>/docs/<versiya>/<yo'l>`, masalan `/uz/docs/v0.1/components/button`.
- Barcha sahifa skeletlari allaqachon bor ("Tez orada" bilan). Siz faylning **ichini
  almashtirasiz**, yangi fayl yaratmaysiz.

### meta.json

`v0.1/meta.json` va `meta.en.json` — sidebar tartibi va `---Bo'lim---` sarlavhalari. Yangi sahifa
qo'shmasangiz, **o'zgartirmang**. Yangi sahifa qo'shilsa — ikkala meta'ga ham, bir xil joyga,
yo'l bilan qo'shing (`"components/yangi-komponent"`). `title`, `root`, `description` maydonlariga
tegmang.

## 2. Frontmatter

```mdx
---
title: Button
description: "Harakatni ishga tushiruvchi tugma: 6 variant, 3 o'lcham, loading."
---
```

- `title` — majburiy. Komponent sahifasida komponent nomi aynan koddagidek (`DatePicker`,
  `IconButton`). Boshqa sahifalarda — o'sha tilda.
- `description` — majburiy, bitta gap (sahifa tepasida, qidiruv va OG rasmda ko'rinadi).
- Qiymatda `'`, `:` yoki `#` bo'lsa — qo'shtirnoqqa oling (`"O'rnatish"`).
- Sahifa matnini `# Sarlavha` bilan BOSHLAMANG — sarlavha frontmatter'dan chiziladi.
  Bo'limlar `##` va `###`.

## 3. Komponent sahifasi tuzilishi (etalon: button.mdx)

1. Birinchi demo (`<ComponentPreview name="<komponent>/<asosiy-demo>" />`) — matnsiz, darhol.
2. `## Import` — bitta kod bloki.
3. `## Qachon ishlatish` / `## When to use` — 3–6 ta qisqa amaliy maslahat.
4. Har bir xususiyat uchun bo'lim (`## Variantlar`, `## O'lchamlar`, `## Holatlar` ...) —
   1–3 gap tushuntirish + demo. **Kamida 3 ta demo.**
5. `## Props` — `<PropsTable>` (bir nechta qismli komponentlarda har bir qism uchun
   `### DialogContent` kabi alohida jadval).
6. (bo'lsa) `### Data atributlari`.
7. `## Accessibility` — klaviatura, ARIA, fokus, ekran o'quvchi. Faqat kodda **haqiqatan bor**
   narsani yozing.

Core/hooks sahifalarida: har bir funksiya/hook — `###` bo'lim, imzo (kod bloki), qisqa tavsif,
misol (`// natija` izohlari bilan) va kerak bo'lsa parametrlar jadvali (`<PropsTable>`).

## 4. Demolar va `<ComponentPreview>`

**Fayl:** `apps/docs/components/demos/<komponent>/<demo-nomi>.tsx`, masalan
`components/demos/button/loading.tsx`. Papka nomi — sahifa slug'i (`date-picker`,
`masked-input`), demo nomi — kebab-case.

```tsx
'use client';

import { Button } from '@akhatmirzo/ui';

export default function ButtonVariants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Saqlash</Button>
      <Button>Soft</Button>
    </div>
  );
}
```

Qat'iy qoidalar (generator buzilganini topsa, build to'xtaydi):

- Birinchi qator — `'use client';`.
- Bitta `export default function ...` — o'zi to'liq, propssiz ishlaydigan komponent.
- Import faqat `@akhatmirzo/ui`, `@akhatmirzo/core`, `@akhatmirzo/hooks`, `react`,
  `lucide-react` (ikonkalar) dan. Docs ichki fayllarini (`@/...`) import qilmang — kod
  foydalanuvchiga ko'rsatiladi va u nusxalab ishlatadi.
- **Faqat semantik tokenlar:** `bg-surface`, `text-text-muted`, `border-border`,
  `bg-primary-soft` ... Hex, `rgb()`, `slate-500` kabi xom ranglar — TAQIQLANGAN.
- Layout uchun oddiy Tailwind: `flex flex-wrap items-center gap-3`, `grid`, `max-w-sm`.
- Demo matnlari o'zbekcha (kutubxona tili) — bitta demo ikkala tilda ishlatiladi.
- Real, tabiiy misollar: "Saqlash", "+998 90 123 45 67", "1 250 000 so'm", "Toshkent".
- Demo kichik va bitta g'oyaga qaratilgan bo'lsin (ko'pi bilan ~40 qator).
- `_` bilan boshlangan `.tsx` fayllar (masalan `_shared.tsx`) registry'ga kirmaydi —
  yordamchi uchun, lekin ko'rsatiladigan kod mustaqil bo'lgani ma'qul.

**Ro'yxatga olish avtomatik:** `scripts/generate-demos.mjs` barcha demolarni skanerlab
`components/demos/registry.generated.ts` ni yaratadi (komponent + manba kodi). U `dev`, `build`
va `typecheck` dan oldin o'zi ishlaydi; qo'lda: `pnpm --filter docs demos`. Registry'ni qo'lda
tahrirlamang.

**MDX'da:**

```mdx
<ComponentPreview name="button/loading" />
<ComponentPreview name="dialog/basic" align="start" />
```

- `name` — `components/demos/` ga nisbatan yo'l, `.tsx` siz.
- `align` — `"center"` (standart) yoki `"start"` (keng/baland demolar, formalar uchun).
- "Ko'rinish / Kod" tablari va nusxa olish tugmasi avtomatik; kod demo faylining o'zidan olinadi.
- Mavjud bo'lmagan `name` — production build'da xato.
- `components/demos/archive/<versiya>/` — eski versiyalarning muzlatilgan demolari (yangi versiya
  chiqarilganda `docs:version` skripti yaratadi, eski sahifalar `name="archive/v0.1/..."` bilan
  ularga ishora qiladi). **Tahrirlamang va yangi demo qo'shmang** — yangi demolar doim
  `components/demos/<sahifa>/` ga yoziladi.

## 5. Props jadvali — `<PropsTable>`

```mdx
<PropsTable
  rows={[
    {
      name: 'variant',
      type: "'primary' | 'soft' | 'outline'",
      default: "'soft'",
      description: "Ko'rinish va vazn",
    },
    { name: 'onValueChange', type: '(value: string) => void', description: "Qiymat o'zgarganda" },
    { name: 'aria-label', type: 'string', required: true, description: "Ekran o'quvchi uchun nom" },
  ]}
/>
```

- Maydonlar: `name`, `type`, `default?`, `required?`, `description?` (matn yoki JSX).
- Sarlavhalar (Prop / Tip / Standart / Tavsif) sahifa tiliga qarab o'zi tarjima qilinadi.
- `type` — TypeScript ko'rinishida, manbadagi interfeysdan aynan ko'chiring.
- `default` — kod ko'rinishida (`"'md'"`, `'false'`, `'300'`); default bo'lmasa — yozmang.
- **Manbani o'qing:** `packages/ui/src/components/<nom>/<nom>.tsx` dagi `export interface ...Props`
  va funksiya parametrlaridagi default qiymatlar. Mavjud bo'lmagan prop'ni yozmang. Meros
  olingan HTML atributlarni ro'yxatlamang — jadval ustida bir gap bilan ayting.
- Fumadocs `<TypeTable>` ham ulangan, lekin komponent sahifalarida `<PropsTable>` ishlating.

## 6. Boshqa MDX komponentlari

| Komponent                                       | Qachon                                                                |
| ----------------------------------------------- | --------------------------------------------------------------------- |
| `<Install pkg="@akhatmirzo/ui" />`              | O'rnatish buyrug'i: pnpm/npm/yarn/bun tablari (`dev` — devDependency) |
| `<Callout title="..." type="info">`             | Eslatma. `type`: `info` · `warn` · `error` · `success` · `idea`       |
| `<Steps><Step>...</Step></Steps>`               | Ketma-ket qadamlar (installation.mdx'dagidek)                         |
| `<Tabs items={['Vite', 'Next.js']}><Tab>...`    | Muqobil variantlar                                                    |
| `<Cards><Card title href description /></Cards>` | Keyingi sahifalarga havolalar                                         |
| `<Accordions><Accordion title="...">`           | FAQ                                                                   |

Kod bloklari: til va (ixtiyoriy) sarlavha — ` ```tsx title="App.tsx" `. Misollar to'liq va
ishlaydigan bo'lsin (importlar bilan).

## 7. Havolalar

- Boshqa docs sahifasiga — **nisbiy fayl yo'li**: `[IconButton](./icon-button.mdx)`,
  `[O'rnatish](../installation.mdx)`. U to'g'ri til va versiyaga o'zi aylanadi.
- `<Card href>` ichida fayl yo'li ishlamaydi — nisbiy URL yozing: `href="./theming"` (sahifa
  `v0.1/installation` bo'lsa) yoki `href="../installation"` (`components/*` dan).
- `/uz/docs/v0.1/...` kabi mutlaq havolalardan qoching.

## 8. Til va uslub

- **O'zbekcha (lotin):** apostrof — oddiy `'` (o', g', so'm, Farg'ona). `ʻ`, `‘`, `’` ishlatmang.
- Tabiiy, sodda, "siz" bilan murojaat. Tarjimadek emas — o'zbek tilida o'ylab yozing.
  Atamalar: komponent, prop, variant, holat, fokus, ekran o'quvchi, klaviatura, standart qiymat.
- **Inglizcha:** sodda, faol nisbat, qisqa gaplar. O'zbekchani so'zma-so'z tarjima qilmang.
- Ikkala tildagi sahifa tuzilishi (bo'limlar, demolar, jadvallar) **bir xil** bo'lsin.
- Sarlavhalar: o'zbekcha — `## Qachon ishlatish`, `## Variantlar`, `## O'lchamlar`,
  `## Holatlar`, `## Props`, `## Accessibility`; inglizcha — `## When to use`, `## Variants`,
  `## Sizes`, `## States`, `## Props`, `## Accessibility`.

## 9. Haqiqatga moslik (eng muhim qoida)

Yozishdan oldin o'qing: `packages/ui/src/components/<nom>/*.tsx`, `specs/01-basic.md`,
`specs/02-interactive.md`, `specs/03-advanced.md`, `packages/*/README.md`, playground namunalari
`apps/playground/src/pages/<nom>.tsx` (tayyor demo kodlari — moslab ko'chiring). Har bir prop,
default qiymat, funksiya imzosi va natija koddagiga mos bo'lsin. Ishonchingiz komil bo'lmasa —
yozmang.

## 10. Tekshirish

```bash
pnpm --filter docs build      # o'tishi shart (demo registry + barcha sahifalar)
pnpm --filter docs typecheck
pnpm lint
pnpm prettier --check apps/docs
pnpm --filter docs dev        # http://localhost:3000/uz va /en
```

Brauzerda: ikkala til, light va dark rejim (demolar ham o'tishi kerak), "Kod" tabi.
