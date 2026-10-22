/*
 * Menyular uchun umumiy ichki qismlar (DropdownMenu va ContextMenu).
 * Panel va qator klasslari `lib/overlay-styles.ts` da; bu yerda — menyuga xos bo'laklar:
 * ikonka joyi, belgi (check/radio) joyi, ichki ikonkalar, `aria-keyshortcuts` va
 * Item ichini (ikonka + matn + Kbd) yig'ish. Eksport qilinmaydi (ichki modul).
 */
import {
  Children,
  cloneElement,
  isValidElement,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { isApplePlatform, Kbd } from '../kbd/kbd';

/** Qator chapidagi ikonka joyi (16px) */
export const menuIconSlot =
  'flex size-4 shrink-0 items-center justify-center text-text-muted group-data-highlighted:text-current';

/** CheckboxItem / RadioItem belgisi joyi */
export const menuIndicatorSlot =
  'flex size-4 shrink-0 items-center justify-center text-primary group-data-highlighted:text-current';

/** Ichki menyu ochiq bo'lganda SubTrigger ajratilgan ko'rinishda qoladi */
export const menuSubTriggerOpen =
  'data-[state=open]:bg-primary-soft data-[state=open]:text-primary-soft-foreground';

/* Ichki ikonkalar */

export function MenuCheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function MenuChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/** RadioItem belgisi — to'ldirilgan doiracha */
export function MenuRadioDot() {
  return <span className="size-2 rounded-full bg-current" />;
}

const subscribe = () => () => {};

/** `["mod", "E"]` → `aria-keyshortcuts="Control+E"` (macOS'da `Meta+E`) */
export function useKeyShortcuts(keys?: string[]) {
  const apple = useSyncExternalStore(subscribe, isApplePlatform, () => false);
  if (!keys?.length) return undefined;
  return keys.map((k) => (k.toLowerCase() === 'mod' ? (apple ? 'Meta' : 'Control') : k)).join('+');
}

/** Qator oxiridagi klaviatura yorlig'i */
export function MenuShortcut({ keys }: { keys?: string[] }) {
  if (!keys || keys.length === 0) return null;
  return <Kbd keys={keys} aria-hidden="true" className="ml-auto" />;
}

interface MenuItemBodyOptions {
  icon?: ReactNode;
  shortcut?: string[];
  danger?: boolean;
  asChild?: boolean;
  children?: ReactNode;
}

/**
 * Item ichi: ikonka + matn + Kbd. `asChild` bo'lsa bolaning (masalan `<a>`) ichiga qo'shiladi.
 */
export function renderMenuItemBody({
  icon,
  shortcut,
  danger,
  asChild,
  children,
}: MenuItemBodyOptions): ReactNode {
  const decorate = (content: ReactNode) => (
    <>
      {icon != null && (
        <span aria-hidden="true" className={cn(menuIconSlot, danger && 'text-current')}>
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{content}</span>
      <MenuShortcut keys={shortcut} />
    </>
  );

  if (!asChild) return decorate(children);
  const child = Children.only(children) as ReactElement<{ children?: ReactNode }>;
  return isValidElement(child)
    ? cloneElement(child, undefined, decorate(child.props.children))
    : child;
}
