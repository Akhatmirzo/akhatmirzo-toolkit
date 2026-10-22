# @akhatmirzo/cli

[![npm](https://img.shields.io/npm/v/@akhatmirzo/cli?color=4f46e5)](https://www.npmjs.com/package/@akhatmirzo/cli)
[![npm yuklab olishlar](https://img.shields.io/npm/dm/@akhatmirzo/cli?label=yuklab%20olishlar)](https://www.npmjs.com/package/@akhatmirzo/cli)
[![CI](https://github.com/Akhatmirzo/akhatmirzo-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/Akhatmirzo/akhatmirzo-toolkit/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Litsenziya: MIT](https://img.shields.io/badge/litsenziya-MIT-22c55e)](https://github.com/Akhatmirzo/akhatmirzo-toolkit/blob/main/LICENSE)

**[`@akhatmirzo/ui`](https://www.npmjs.com/package/@akhatmirzo/ui) ni loyihaga bitta buyruq bilan
ulash va tayyor bloklarni — kirish formasi, narxlar, dashboard — to'g'ridan-to'g'ri kodingizga
ko'chirish.**

Hujjatlar: **https://toolkit.akhatmirzo.uz/uz/docs/v0.4/cli**

- **O'rnatish shart emas** — `npx` (yoki `pnpm dlx`, `yarn dlx`, `bunx`) orqali ishga tushiring.
- **Bloklar sizning kodingizda** — paket ichida emas, loyihangizdagi faylda: xohlaganingizcha
  o'zgartiring.
- **Bog'liqliksiz** — faqat Node'ning ichki modullari. Talab: **Node.js 18.17+**.
- **Ehtiyotkor** — fayllar faqat loyiha papkasi ichiga yoziladi, mavjud fayllar so'ralmasdan
  qayta yozilmaydi.

```bash
npx @akhatmirzo/cli init              # paketlar + CSS sozlamasi
npx @akhatmirzo/cli list              # mavjud bloklar
npx @akhatmirzo/cli add login pricing # bloklarni loyihaga ko'chirish
```

## Buyruqlar

| Buyruq          | Vazifasi                                                           |
| --------------- | ------------------------------------------------------------------ |
| `init`          | Paketlarni o'rnatadi, global CSS'ga tokenlar va `@source` qo'shadi |
| `add <blok...>` | Bloklarni registry'dan loyihaga ko'chiradi                         |
| `list`          | Mavjud bloklar ro'yxati — kategoriya, nom va tavsif bilan          |

### init

Loyiha papkasida (`package.json` yonida) ishga tushiring:

1. **Tailwind CSS v4** borligini tekshiradi. Yo'q yoki v3 bo'lsa — ogohlantiradi, lekin
   to'xtamaydi.
2. **Paket menejerini aniqlaydi** — lockfile bo'yicha (`pnpm`, `npm`, `yarn`, `bun`; monorepoda
   yuqori papkalar ham qaraladi).
3. `@akhatmirzo/ui` va `@akhatmirzo/tokens` ni **o'rnatadi** (allaqachon bo'lsa — o'tkazib
   yuboradi).
4. **Global CSS faylni topadi** (`app/globals.css`, `src/app/globals.css`, `src/index.css` ...).
   Topilmasa — so'raydi yoki `--css` bilan ko'rsating.
5. CSS'ga ikki qator qo'shadi:

```css
@import 'tailwindcss';
@import '@akhatmirzo/tokens/theme.css'; /* qo'shildi */
@source '../../node_modules/@akhatmirzo/ui/dist'; /* qo'shildi */
```

`@source` yo'li CSS fayldan `node_modules` gacha nisbiy hisoblanadi. Qatorlar allaqachon bo'lsa
qayta qo'shilmaydi — `init` ni bir necha marta ishga tushirish xavfsiz. Shundan so'ng ilova
ildiziga provayderlarni qo'ying —
[O'rnatish](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/installation).

### add

```bash
npx @akhatmirzo/cli add login
npx @akhatmirzo/cli add login pricing --dir src/components/blocks
```

- Bloklar `--dir` papkasiga (standart: `components/blocks`) yoziladi.
- Avval **hamma bloklar** yuklanib tekshiriladi — biror xato bo'lsa, hech narsa yozilmaydi.
- Fayl allaqachon bor bo'lsa — so'raydi; `--overwrite` — savolsiz ustidan yozadi, `--yes` esa
  mavjud fayllarni **o'zgartirmaydi** (o'tkazib yuboradi).
- Blokka qo'shimcha paketlar kerak bo'lsa (`react-hook-form`, `zod`, `recharts` ...) va ular
  `package.json` da bo'lmasa — o'rnatishni taklif qiladi.

## Parametrlar

| Parametr                        | Tavsif                                                              |
| ------------------------------- | ------------------------------------------------------------------- |
| `--cwd <papka>`                 | Loyiha papkasi (standart: joriy papka)                              |
| `-y`, `--yes`                   | Savollarga "ha" (paket o'rnatish); mavjud fayllar baribir saqlanadi |
| `-o`, `--overwrite`             | `add`: mavjud fayllar ustidan yozish                                |
| `--no-install`                  | Paketlarni o'rnatmaslik — faqat o'rnatish buyrug'ini ko'rsatadi     |
| `-d`, `--dir <papka>`           | `add`: bloklar papkasi (standart: `components/blocks`)              |
| `--css <fayl>`                  | `init`: global CSS fayl (standart: avtomatik topiladi)              |
| `-r`, `--registry <url\|papka>` | Registry manzili (standart: `https://toolkit.akhatmirzo.uz/r`)      |
| `-h`, `--help`                  | Yordam                                                              |
| `-v`, `--version`               | Versiya                                                             |

Muhit o'zgaruvchilari: `AKHATMIRZO_REGISTRY` — `--registry` berilmaganda ishlatiladigan registry
manzili; `NO_COLOR` — rangli chiqishni o'chiradi.

CI kabi interaktiv bo'lmagan muhitda savol berilmaydi: `init` uchun `--yes` majburiy, `add` esa
yangi fayllarni yozadi, mavjudlarini o'tkazib yuboradi va paketlarni o'rnatmaydi (o'rnatish
buyrug'ini ko'rsatadi).

## Registry

Registry — oddiy JSON fayllar: `<registry>/index.json` (ro'yxat) va `<registry>/<nom>.json`
(blok fayllari va bog'liqliklari). O'z serveringiz, `file://` URL yoki lokal papkani ko'rsatish
mumkin:

```bash
npx @akhatmirzo/cli add login --registry ./registry
AKHATMIRZO_REGISTRY=https://example.com/r npx @akhatmirzo/cli list
```

## Xavfsizlik

- CLI fayllarni **faqat loyiha papkasi ichiga** yozadi.
- Registry'dagi fayl yo'llari qat'iy tekshiriladi: absolyut yo'llar, `..` segmentlari, nuqta
  bilan boshlangan nomlar va `--dir` dan tashqariga chiqadigan har qanday yo'l rad etiladi;
  symlink orqali tashqariga yozish ham bloklanadi.
- Paket nomlari ham tekshiriladi va o'rnatishdan oldin sizdan so'raladi.
- Begona registry ishlatsangiz, yozilgan kodni ko'rib chiqing — u loyihangizning bir qismiga
  aylanadi.

Bloklar ro'yxati va jonli ko'rinishi:
[hujjatlarda](https://toolkit.akhatmirzo.uz/uz/docs/v0.4/blocks).

## Litsenziya

[MIT](https://github.com/Akhatmirzo/akhatmirzo-toolkit/blob/main/LICENSE) © Akhatmirzo

---

## English

A zero-dependency CLI (Node.js 18.17+) for `@akhatmirzo/ui`. Run it with `npx` — no install
needed.

```bash
npx @akhatmirzo/cli init              # install packages, add tokens and @source to your global CSS
npx @akhatmirzo/cli list              # list available blocks
npx @akhatmirzo/cli add login pricing # copy blocks into your project
```

- `init` checks for Tailwind CSS v4, detects your package manager from the lockfile, installs
  `@akhatmirzo/ui` and `@akhatmirzo/tokens`, finds your global CSS file and adds the tokens import
  and a relative `@source` line. Safe to run more than once.
- `add` copies blocks into `components/blocks` (change with `--dir`). All blocks are fetched and
  validated before anything is written; existing files are never overwritten without asking
  (`--overwrite` to force, `--yes` keeps them). Missing dependencies are offered for install.
- Flags: `--cwd`, `-y/--yes`, `-o/--overwrite`, `--no-install`, `-d/--dir`, `--css`,
  `-r/--registry` (or the `AKHATMIRZO_REGISTRY` environment variable — a URL, a `file://` URL or a
  local folder), `-h/--help`, `-v/--version`.
- Security: files are written only inside the project; registry file paths are strictly
  validated (no absolute paths, `..` segments, dotfiles, paths escaping `--dir` or writes through
  symlinks), and package names are validated and confirmed before install.

Docs: https://toolkit.akhatmirzo.uz/en/docs/v0.4/cli
