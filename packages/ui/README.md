# @akhatmirzo/ui

Tailwind CSS v4 va Radix UI asosidagi React komponentlar. O'zbek tiliga moslangan (matnlar, qidiruv, telefon/karta/pul formatlari), klaviatura va ekran o'quvchilar uchun to'liq qulay, light va dark rejimli.

```bash
pnpm add @akhatmirzo/ui @akhatmirzo/tokens
```

Talablar: React 18+, Tailwind CSS v4.

## Ulash

```css
/* app.css */
@import 'tailwindcss';
@import '@akhatmirzo/tokens/theme.css';
/* Komponentlardagi klasslarni Tailwind skanerlashi uchun — unutmang! (yo'l CSS faylga nisbatan) */
@source '../node_modules/@akhatmirzo/ui/dist';
```

Ilova ildizida bir marta (`toast()`, `confirm()` va tooltiplar shularsiz ishlamaydi):

```tsx
import { ConfirmProvider, Toaster, TooltipProvider } from '@akhatmirzo/ui';

<TooltipProvider>
  <ConfirmProvider>
    <App />
    <Toaster position="bottom-right" />
  </ConfirmProvider>
</TooltipProvider>
```

## Misol

```tsx
import { Button, Field, PhoneInput, Select, toast } from '@akhatmirzo/ui';

<Field label="Telefon" description="SMS kod yuboriladi" error={errors.phone}>
  <PhoneInput value={phone} onValueChange={setPhone} />
</Field>

<Field label="Viloyat">
  <Select value={region} onValueChange={setRegion}>
    <Select.Item value="tsh">Toshkent</Select.Item>
    <Select.Item value="sam">Samarqand</Select.Item>
  </Select>
</Field>

<Button variant="primary" loading={saving} onClick={() => toast.success('Saqlandi')}>
  Saqlash
</Button>
```

## Komponentlar

| Bo'lim | Komponentlar |
|---|---|
| Asoslar | `Button`, `IconButton`, `Kbd`, `Spinner` |
| Formalar | `Field`, `Input`, `Textarea`, `Select`, `Combobox`, `DatePicker`, `DateRangePicker`, `Calendar`, `PhoneInput`, `MoneyInput`, `CardInput`, `MaskedInput`, `OtpInput`, `FileUpload` |
| Tanlov | `Checkbox`, `RadioGroup` / `Radio`, `Switch` |
| Ko'rsatish | `Badge`, `Avatar` / `AvatarGroup`, `Card`, `Skeleton`, `Divider` |
| Overlay | `Dialog` (+ `confirm()`), `Drawer`, `Popover`, `Tooltip`, `Toast` (`toast()`), `DropdownMenu`, `CommandPalette` |
| Navigatsiya | `Tabs`, `Accordion` |
| Ma'lumotlar | `DataTable`, `VirtualList` |

Umumiy qoidalar: barcha boshqaruv elementlari `size="sm" | "md" | "lg"` (32/40/48px), `className` (tashqaridagi klass ustun), `ref`, qolgan HTML atributlari; holatlar `data-*` atributlarida (`data-state`, `data-disabled` ...). To'liq spetsifikatsiyalar: [specs/](https://github.com/Akhatmirzo/akhatmirzo-toolkit/tree/main/specs).

Jonli namunalar — repodagi playground: `pnpm install && pnpm dev`.

## Litsenziya

MIT
