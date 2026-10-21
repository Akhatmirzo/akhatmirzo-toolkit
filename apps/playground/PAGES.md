# Playground sahifasini qo'shish

1. Fayl yarating: `src/pages/<slug>.tsx` (masalan `button.tsx`). Fayl nomi — manzil: `#/button`. Sahifa avtomatik topiladi (`import.meta.glob`), ro'yxatga qo'lda qo'shish shart emas.
2. Modul ikki narsa eksport qiladi:
   ```tsx
   import type { PageMeta } from '../pages';
   export const meta: PageMeta = { title: 'Button', group: 'Asoslar', order: 1 };
   export default function Page() { /* ... */ }
   ```
3. `group` — faqat shulardan biri (sidebar shu tartibda): `Asoslar`, `Tokenlar`, `Formalar`, `Tanlov`, `Ko'rsatish`, `Overlay`, `Navigatsiya`, `Ma'lumotlar`, `Funksiyalar` (`@akhatmirzo/core` va `@akhatmirzo/hooks` namoyishlari). Guruh ichida `order` bo'yicha saralanadi (`Asoslar` da `0` band — "Umumiy").
4. Komponentlar `@akhatmirzo/ui` dan import qilinadi: `import { Button } from '@akhatmirzo/ui';` (src'dan, HMR bilan).
5. Demo yordamchilari — `../demo`:
   - `<DemoPage title description>` — sahifa ildizi (bitta).
   - `<DemoSection title description>` — karta ichidagi bo'lim (variantlar, o'lchamlar, holatlar ...).
   - `<DemoRow label>` — elementlarni qatorga tizadi, sig'masa o'raladi.
   - `<DemoGrid min={200}>` — moslashuvchan to'r; `<Code>` — inline kod.
6. Tavsiya etilgan bo'limlar: Variantlar → O'lchamlar → Holatlar (disabled, loading, invalid) → Kompozitsiya / asChild → Dark mode'da tekshirish.
7. Stillar faqat semantik tokenlar bilan (`bg-surface`, `text-text-muted`, `border-border`); hex qiymat yozmang. Barcha matnlar o'zbek tilida (lotin).
8. Light/Dark almashtirgich yuqorida — har bir sahifani ikkala mavzuda ko'rib chiqing.
