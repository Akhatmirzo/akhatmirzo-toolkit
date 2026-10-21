/*
 * Suzuvchi qatlamlar uchun umumiy klasslar (specs/02-interactive.md, "Umumiy" bo'limi).
 * Dropdown Menu, Select, Combobox va Popover bir xil ko'rinishi uchun shu yerdan oladi.
 */

/** Panel animatsiyasi: Radix `data-state` va `data-side` atributlariga bog'langan */
export const floatingMotion = [
  'data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out',
  'data-[side=top]:[--ak-popover-shift:4px]',
  'motion-reduce:data-[state=open]:animate-overlay-in motion-reduce:data-[state=closed]:animate-overlay-out',
  'origin-(--radix-popper-transform-origin)',
].join(' ');

/** Ro'yxatli panel (menyu, select, combobox): radius xl, soya md, ichki padding 6px */
export const floatingPanel = [
  'z-(--ak-z-dropdown) min-w-45 overflow-hidden rounded-xl border-0 bg-surface-raised p-1.5 font-sans text-text shadow-md outline-none',
  floatingMotion,
].join(' ');

/** Kontentli panel (Popover): padding 16px, soya lg */
export const floatingContentPanel = [
  'z-(--ak-z-dropdown) rounded-xl border-0 bg-surface-raised p-4 font-sans text-text shadow-lg outline-none',
  floatingMotion,
].join(' ');

/** Menyu / variant qatori: 36px, radius md; klaviatura yoki sichqoncha bilan ajratilgan — primary-soft */
export const listItem = [
  'relative flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-sm text-text outline-none select-none',
  'data-highlighted:bg-primary-soft data-highlighted:text-primary-soft-foreground',
  'data-[selected=true]:bg-primary-soft data-[selected=true]:text-primary-soft-foreground',
  'data-disabled:pointer-events-none data-disabled:opacity-50',
  '[&_svg]:size-4 [&_svg]:shrink-0',
].join(' ');

/** Xavfli menyu qatori (O'chirish) */
export const listItemDanger =
  'text-danger-soft-foreground data-highlighted:bg-danger-soft data-highlighted:text-danger-soft-foreground';

/** Guruh sarlavhasi */
export const listLabel = 'px-2.5 pt-2 pb-1 text-xs font-medium text-text-muted';

/** Ajratuvchi chiziq — panel chetlarigacha */
export const listSeparator = '-mx-1.5 my-1.5 h-px bg-border';

/** Dialog / Drawer / Command Palette foni */
export const overlayBackdrop = [
  'fixed inset-0 z-(--ak-z-overlay) bg-overlay',
  'data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out',
].join(' ');
