/** Input va Textarea konteynerining umumiy ko'rinishi (fokus halqasi shu yerda, elementda emas) */
export const controlContainerBase = [
  'relative flex w-full rounded-lg border border-border bg-surface font-sans text-text shadow-xs',
  'transition-[border-color,box-shadow,background-color] duration-base ease-out',
  'focus-ring-within',
  'hover:not-focus-within:not-data-disabled:not-data-invalid:border-border-strong',
  'data-invalid:border-danger',
  'data-readonly:bg-surface-muted',
  'data-disabled:cursor-not-allowed data-disabled:bg-surface-muted data-disabled:opacity-50 data-disabled:shadow-none',
].join(' ');

/** Ichki native element: o'z halqasi, foni va chegarasi yo'q (autofill foni ham bo'yaladi) */
export const controlElementBase = [
  'min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 font-sans text-text outline-none placeholder:text-text-faint disabled:cursor-not-allowed',
  'autofill:shadow-[inset_0_0_0_1000px_var(--ak-surface)] autofill:[-webkit-text-fill-color:var(--ak-text)] autofill:[caret-color:var(--ak-text)]',
].join(' ');
