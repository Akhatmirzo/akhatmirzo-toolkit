# Komponentlar uchun umumiy qoidalar

> Holat: ✅ tasdiqlandi · Barcha komponentlar shu qoidalarga bo'ysunadi.
> Maqsad: bitta komponentni o'rgangan odam qolganlarini ham "taxmin qilib" ishlata olsin.

---

## 1. O'lchamlar (`size`)

Barcha boshqaruv elementlari (Button, Input, Select, ...) bir xil balandlikda:

| `size` | Balandlik | Matn | Padding — Button | Padding — Input / Select | Ikonka |
|---|---|---|---|---|---|
| `sm` | 32px | `text-sm` (14) | 12px | 10px (`px-2.5`) | 16px |
| `md` **(default)** | 40px | `text-sm` (14) | 16px | 12px (`px-3`) | 18px |
| `lg` | 48px | `text-base` (16) | 20px | 16px (`px-4`) | 20px |

> Shu tufayli `<Input size="md" />` va `<Button size="md" />` bir qatorda tekis turadi.

## 2. Variantlar (`variant`)

Bir xil nomlar barcha komponentlarda bir xil ma'noni bildiradi:

| Nom | Ma'nosi |
|---|---|
| `primary` | Asosiy, eng muhim harakat. **Bitta ko'rinishda bittadan ko'p bo'lmasin** |
| `soft` | Ikkilamchi — yumshoq to'ldirilgan (B yo'nalishining "default"i) |
| `outline` | Chegarali, neytral |
| `ghost` | Fonsiz, faqat hover'da ko'rinadi |
| `danger` | Xavfli harakat (o'chirish) |

Status ranglari uchun `color`: `neutral | primary | success | warning | danger | info` (Badge, Alert, Toast).

## 3. Props nomlash

| Vazifa | Nom | Misol |
|---|---|---|
| Boshqariladigan qiymat | `value` + `onValueChange` | `<Select value={x} onValueChange={setX} />` |
| Boshqarilmaydigan | `defaultValue` | `<Tabs defaultValue="a" />` |
| Ochiq/yopiq | `open` + `onOpenChange` / `defaultOpen` | `<Dialog open={o} onOpenChange={setO} />` |
| Boolean | `is`/`has` siz | `disabled`, `loading`, `invalid` (❌ `isDisabled`) |
| Ikonkalar | `leftIcon`, `rightIcon` (`ReactNode`) | `<Button leftIcon={<Plus />} />` |
| Event | `on` + fe'l | `onClear`, `onFilesChange` |

> Radix bilan bir xil nomlash — ichida Radix ishlatilsa ham, ishlatilmasa ham API bir xil.

## 4. Har bir komponent albatta qo'llab-quvvatlaydi

- [ ] **`className`** — `cn()` orqali birlashtiriladi; tashqaridan berilgan klass ustun turadi
- [ ] **`ref`** — DOM elementga yo'naltiriladi (React 19: oddiy prop)
- [ ] **Qolgan HTML atributlar** — `...props` orqali ildiz elementga (`id`, `aria-*`, `data-*`, `onClick`...)
- [ ] **`asChild`** (kerak joyda) — komponent o'z elementini emas, bolasini render qiladi:
  `<Button asChild><a href="/">Bosh sahifa</a></Button>` → stil Button'niki, element `<a>`

## 5. Holatlar va styling

Holatlar **`data-*` atributlar** orqali chiqariladi (Radix uslubi), Tailwind ularga bog'lanadi:

| Atribut | Qiymatlar |
|---|---|
| `data-state` | `open` / `closed`, `checked` / `unchecked`, `active` / `inactive` |
| `data-disabled` | mavjud / yo'q |
| `data-invalid` | mavjud / yo'q |
| `data-loading` | mavjud / yo'q |
| `data-size`, `data-variant` | joriy qiymat |

Har bir interaktiv element uchun **8 holat** loyihalanadi:
`default · hover · active (press) · focus-visible · disabled · loading · invalid · selected/checked`

### Focus ring (hamma joyda bir xil)
`outline: 2px solid var(--color-ring); outline-offset: 2px` — faqat **`:focus-visible`** da (sichqoncha bosilganda chiqmaydi, klaviaturada chiqadi).

### Tashqi stillardan himoya
Prototipda aniqlangan muammo: ilovaning global `button { ... }` / `input { ... }` stillari komponentni buzishi mumkin.
- Komponent **fon, matn rangi, chegara, shrift** ni doim **aniq** belgilaydi — brauzer yoki ilovadan "meros"ga tashlab qo'ymaydi
- Tailwind **Preflight** (brauzer stillarini tozalash) ilovada yoqilgan deb hisoblanadi; README'da yozib qo'yiladi
- Native `<input>` ichki fonlari (`autofill`, dark mode) alohida tekshiriladi

### Disabled
- `opacity: 0.5`, `cursor: not-allowed`, hover effektlari o'chadi
- Imkon qadar disabled o'rniga **sababini ko'rsatish** afzal (tooltip yoki yordamchi matn)

## 6. Forma maydonlari — `Field` kompozitsiyasi

Label, izoh va xato matni har bir input'da qayta yozilmaydi — `Field` o'raydi va **id / aria atributlarini avtomatik ulaydi**:

```tsx
<Field label="Telefon" description="SMS kod yuboriladi" error={errors.phone}>
  <Input placeholder="+998 90 123 45 67" />
</Field>
```
Natija: `<label for>`, `aria-describedby`, `aria-invalid` — o'zi qo'yiladi.

## 7. Ikonkalar

- Kutubxona **ikonka to'plamini o'z ichiga olmaydi** — ikonkalar `ReactNode` sifatida beriladi (lucide-react, tabler — farqi yo'q)
- Ichki kerakli ikonkalar (chevron, check, x, spinner) — kutubxona ichida **inline SVG**, bog'liqliksiz

## 8. Accessibility minimumi

- Klaviatura bilan to'liq ishlash
- Faqat ikonkali tugmada `aria-label` **majburiy** (TypeScript orqali talab qilinadi)
- Rang yagona signal emas (xato — qizil rang + ikonka + matn)
- Touch target ≥ 40px (`sm` o'lchamda ko'rinmas kengaytirilgan bosish maydoni)

## 9. Matnlar (UX copy)

- Komponentlar ichidagi standart matnlar (`"Yopish"`, `"Hech narsa topilmadi"`) **o'zgartiriladigan** — `labels` prop yoki global `Provider` orqali (keyinroq boshqa tillar uchun)
- Default til: **o'zbek (lotin)**
