# docs — @akhatmirzo/ui hujjatlar sayti

Next.js 16 + [Fumadocs](https://fumadocs.dev) 16. Manzil: https://toolkit.akhatmirzo.uz

- Tillar: `uz` (asosiy) va `en` — `/uz/...`, `/en/...`. `/` brauzer tiliga qarab (yoki `uz` ga)
  yo'naltiriladi.
- Versiyalar (minor bo'yicha): `content/docs/v0.1/`, `content/docs/v0.2/` ... Sidebar'da versiya
  tanlagich, eski versiya sahifasida ogohlantirish banneri.
- Kontent yozish qoidalari: [CONTENT-GUIDE.md](CONTENT-GUIDE.md).

## Ishga tushirish

Talablar: Node 20+, pnpm 9. Repo ildizida:

```bash
pnpm install
pnpm build                    # paketlar dist/ ga (docs ularni dist'dan oladi)
pnpm --filter docs dev        # http://localhost:3000 → /uz yoki /en
```

`packages/*` dagi kodni o'zgartirsangiz, docs'da ko'rinishi uchun `pnpm build` ni qayta
ishga tushiring (yoki o'sha paketda `pnpm --filter @akhatmirzo/ui build`). Demo qo'shganda
registry `dev` ishga tushganda yangilanadi; dev server ishlab turgan bo'lsa —
`pnpm --filter docs demos`.

| Buyruq                                    | Nima qiladi                                       |
| ----------------------------------------- | ------------------------------------------------- |
| `pnpm --filter docs dev`                  | Dev server (3000-port)                            |
| `pnpm --filter docs build`                | Production build                                  |
| `pnpm --filter docs start`                | Build'ni ishga tushirish                          |
| `pnpm --filter docs typecheck`            | TypeScript tekshiruvi                             |
| `pnpm --filter docs demos`                | Demo registry'ni qayta yaratish                   |
| `pnpm --filter docs docs:version <a> <b>` | Yangi hujjat versiyasi (pastda)                   |

`dev`, `build` va `typecheck` avval `scripts/generate-demos.mjs` ni ishga tushiradi.
`typecheck` workspace paketlarining tiplarini `src/` dan oladi (`tsconfig.json` dagi
`customConditions: ["source"]`), shuning uchun `dist/` bo'lmasa ham (toza CI) ishlaydi; `dev` va
`build` esa paketlarni `dist/` dan oladi.

## Tuzilish

| Yo'l                                  | Vazifasi                                                            |
| ------------------------------------- | ------------------------------------------------------------------- |
| `app/[lang]/(home)`                   | Bosh sahifa                                                         |
| `app/[lang]/docs/[[...slug]]`         | Hujjat sahifalari (`/uz/docs` → eng so'nggi versiya)                 |
| `app/[lang]/og`, `app/[lang]/llms.mdx` | OG rasmlar va sahifalarning Markdown ko'rinishi                    |
| `app/api/search`                      | Qidiruv                                                             |
| `app/sitemap.ts`, `app/robots.ts`     | SEO                                                                 |
| `proxy.ts`                            | i18n yo'naltirish + Markdown (`.md`, `Accept: text/markdown`)       |
| `lib/i18n.ts`, `lib/translations.ts`  | Tillar va Fumadocs interfeysi tarjimalari                           |
| `lib/dictionary.ts`                   | Saytning o'z matnlari (bosh sahifa, banner, jadval sarlavhalari)    |
| `lib/versions.json`                   | Versiyalar ro'yxati va eng so'nggisi                                |
| `components/mdx.tsx`                  | MDX komponentlari: `ComponentPreview`, `PropsTable`, `Install` ...  |
| `components/search-dialog.tsx`        | Qidiruv oynasi: natijalar joriy versiya bo'yicha filtrlanadi        |
| `lib/remark-llms-components.mjs`      | `.md`/`llms-full.txt` da demo kodi va props jadvali Markdown'da     |
| `components/demos/`                   | Komponent demolari (+ avtomatik `registry.generated.ts`)            |
| `components/demos/archive/<versiya>/` | Eski versiyalarning muzlatilgan demolari (`docs:version` yaratadi)  |
| `content/docs/`                       | Kontent (MDX)                                                       |

Dizayn: `app/global.css` da `@akhatmirzo/tokens/theme.css` ulangan va Fumadocs ranglari
(`--color-fd-*`) kutubxona tokenlariga bog'langan. Dark mode: next-themes `<html>` ga ham
`class="dark"`, ham `data-theme="dark"` qo'yadi — sayt ham, demolar ham birga o'tadi.

## Yangi versiya chiqarish

Hujjatlar **minor** versiyalar bo'yicha saqlanadi (`v0.1`, `v0.2`, `v1.0` ...). Patch relizlar
(`0.1.1`) uchun yangi papka kerak emas — joriy versiya papkasini tahrirlang.

1. Kutubxonaning yangi minor versiyasi chiqishidan oldin (yoki keyin) skriptni ishga tushiring:

   ```bash
   pnpm --filter docs docs:version v0.1 v0.2
   ```

   Skript:
   - `content/docs/v0.1` ni `content/docs/v0.2` ga nusxalaydi (ikkala til bilan);
   - `v0.2/meta*.json` da `title` ni `v0.2` ga, tavsifni "Eng so'nggi versiya" ga o'zgartiradi;
   - `v0.1/meta*.json` tavsifini "Eski versiya" qiladi;
   - `content/docs/meta.json` da `v0.2` ni ro'yxat boshiga qo'yadi;
   - `lib/versions.json` da `latest` ni `v0.2` qiladi;
   - yangi papkadagi `/docs/v0.1/` mutlaq havolalarini `/docs/v0.2/` ga almashtiradi;
   - demolarni muzlatadi: `components/demos/**` → `components/demos/archive/v0.1/**`, `v0.1`
     sahifalaridagi `<ComponentPreview name="x/y">` esa `name="archive/v0.1/x/y"` bo'ladi. Shunda
     `v0.2` da demo o'zgarsa yoki o'chirilsa ham, `v0.1` sahifalari o'z demolari va kodini
     ko'rsatadi.

2. Yangi versiyada o'zgargan sahifalarni `content/docs/v0.2/` da yangilang. `v0.1` ga tegmang.
3. `v0.2/versions.mdx` (va `.en.mdx`) ga CHANGELOG'dagi yangiliklarni qo'shing.
4. Tekshiring: `pnpm --filter docs build`. Natija:
   - `/uz/docs` → `/uz/docs/v0.2/introduction`;
   - sidebar'dagi tanlagichda `v0.2` (eng so'nggi) va `v0.1`;
   - `v0.1` sahifalarida "Bu eski versiya hujjati" banneri va eng so'nggisiga havola.

Versiya qatori formati qat'iy: `v<major>.<minor>`.

Cheklov: muzlatilgan demolar ham workspace'dagi **joriy** `@akhatmirzo/ui` bilan render qilinadi
(npm'dagi eski paket bilan emas). Agar keyingi versiyada prop olib tashlansa va
`archive/<eski>/...` dagi demo typecheck/build'dan o'tmay qolsa, o'sha arxiv demoni minimal
tuzating (yoki eski API'ni deprecated sifatida qoldiring).

## Vercel'ga chiqarish

`vercel.json` monorepo uchun sozlangan. Vercel loyihasida:

- **Root Directory:** `apps/docs`
- **Framework:** Next.js (vercel.json'da ham ko'rsatilgan)
- Install: repo ildizida `pnpm install --frozen-lockfile`
- Build: avval workspace bog'liqliklari (`pnpm --filter "docs^..." build` — core, hooks, ui),
  keyin `pnpm --filter docs build`
- Output: `.next`
- "Include source files outside of the Root Directory" yoqilgan bo'lsin (standart holatda yoqiq).

Domen: `toolkit.akhatmirzo.uz`. Sitemap, robots, OG, kanonik havolalar va `metadataBase` uchun
manzil `lib/shared.ts` dagi `siteUrl` dan olinadi: `NEXT_PUBLIC_SITE_URL` (boshqa domenga
ko'chirilsa, Vercel'da shu o'zgaruvchini qo'shing), aks holda `https://toolkit.akhatmirzo.uz`.
Preview build'lar ham kanonikni production domeniga ko'rsatadi — ataylab shunday.

Sitemap'dagi `lastmod` git tarixidan olinadi (`lib/last-modified.ts`). Vercel sayoz klon qiladi —
to'g'ri sanalar uchun loyiha sozlamalariga `VERCEL_DEEP_CLONE=true` muhit o'zgaruvchisini qo'shing
(bo'lmasa, tarixi klonga sig'magan sahifalarda `lastmod` shunchaki yozilmaydi).
