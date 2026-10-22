import { useControllableState } from '@akhatmirzo/hooks';
import * as RadixContextMenu from '@radix-ui/react-context-menu';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { useFloatingLayer } from '../../lib/modal-layer';
import {
  floatingPanel,
  listItem,
  listItemDanger,
  listLabel,
  listSeparator,
} from '../../lib/overlay-styles';
import {
  MenuCheckIcon,
  MenuChevronRightIcon,
  menuIconSlot,
  menuIndicatorSlot,
  MenuRadioDot,
  MenuShortcut,
  menuSubTriggerOpen,
  renderMenuItemBody,
  useKeyShortcuts,
} from '../menu/menu-parts';

const contentScroll = 'max-h-(--radix-context-menu-content-available-height) overflow-y-auto';

/* Root */

export type ContextMenuProps = ComponentProps<typeof RadixContextMenu.Root>;

function ContextMenuRoot(props: ContextMenuProps) {
  return <RadixContextMenu.Root {...props} />;
}

/* Trigger */

export type ContextMenuTriggerProps = ComponentProps<typeof RadixContextMenu.Trigger>;

/**
 * O'ng tugma (yoki sensorli ekranda uzoq bosish) bilan menyu ochiladigan hudud.
 * Stil berilmaydi — odatda `asChild` bilan karta, qator yoki rasm o'raladi.
 */
export function ContextMenuTrigger(props: ContextMenuTriggerProps) {
  return <RadixContextMenu.Trigger data-slot="context-menu-trigger" {...props} />;
}

/* Content */

export interface ContextMenuContentProps extends ComponentProps<typeof RadixContextMenu.Content> {
  /** Portal konteyneri (default — `document.body`) */
  container?: HTMLElement | null;
}

/** Menyu paneli — kursor turgan joyda ochiladi */
export function ContextMenuContent({
  collisionPadding = 8,
  loop = true,
  container,
  className,
  ...props
}: ContextMenuContentProps) {
  const layer = useFloatingLayer();
  return (
    <RadixContextMenu.Portal container={container}>
      <RadixContextMenu.Content
        data-slot="context-menu-content"
        collisionPadding={collisionPadding}
        loop={loop}
        className={cn(floatingPanel, layer, contentScroll, className)}
        {...props}
      />
    </RadixContextMenu.Portal>
  );
}

/* Item */

export interface ContextMenuItemProps extends ComponentProps<typeof RadixContextMenu.Item> {
  /** Chapdagi ikonka (16px) */
  icon?: ReactNode;
  /** O'ngdagi klaviatura yorlig'i, masalan `["mod", "E"]` */
  shortcut?: string[];
  variant?: 'default' | 'danger';
}

export function ContextMenuItem({
  icon,
  shortcut,
  variant = 'default',
  asChild,
  className,
  children,
  ...props
}: ContextMenuItemProps) {
  const danger = variant === 'danger';
  const keyShortcuts = useKeyShortcuts(shortcut);
  return (
    <RadixContextMenu.Item
      data-slot="context-menu-item"
      data-variant={variant}
      aria-keyshortcuts={keyShortcuts}
      asChild={asChild}
      className={cn('group', listItem, danger && listItemDanger, className)}
      {...props}
    >
      {renderMenuItemBody({ icon, shortcut, danger, asChild, children })}
    </RadixContextMenu.Item>
  );
}

/* CheckboxItem */

export interface ContextMenuCheckboxItemProps extends ComponentProps<
  typeof RadixContextMenu.CheckboxItem
> {
  shortcut?: string[];
}

export function ContextMenuCheckboxItem({
  shortcut,
  className,
  children,
  ...props
}: ContextMenuCheckboxItemProps) {
  const keyShortcuts = useKeyShortcuts(shortcut);
  return (
    <RadixContextMenu.CheckboxItem
      data-slot="context-menu-checkbox-item"
      aria-keyshortcuts={keyShortcuts}
      className={cn('group', listItem, className)}
      {...props}
    >
      <span className={menuIndicatorSlot}>
        <RadixContextMenu.ItemIndicator className="flex">
          <MenuCheckIcon />
        </RadixContextMenu.ItemIndicator>
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <MenuShortcut keys={shortcut} />
    </RadixContextMenu.CheckboxItem>
  );
}

/* RadioGroup + RadioItem */

export interface ContextMenuRadioGroupProps extends ComponentProps<
  typeof RadixContextMenu.RadioGroup
> {
  /** Boshqarilmaydigan rejim uchun boshlang'ich qiymat */
  defaultValue?: string;
}

export function ContextMenuRadioGroup({
  value: valueProp,
  defaultValue,
  onValueChange,
  ...props
}: ContextMenuRadioGroupProps) {
  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });
  return (
    <RadixContextMenu.RadioGroup
      data-slot="context-menu-radio-group"
      value={value}
      onValueChange={setValue}
      {...props}
    />
  );
}

export interface ContextMenuRadioItemProps extends ComponentProps<
  typeof RadixContextMenu.RadioItem
> {
  shortcut?: string[];
}

export function ContextMenuRadioItem({
  shortcut,
  className,
  children,
  ...props
}: ContextMenuRadioItemProps) {
  const keyShortcuts = useKeyShortcuts(shortcut);
  return (
    <RadixContextMenu.RadioItem
      data-slot="context-menu-radio-item"
      aria-keyshortcuts={keyShortcuts}
      className={cn('group', listItem, className)}
      {...props}
    >
      <span className={menuIndicatorSlot}>
        <RadixContextMenu.ItemIndicator className="flex">
          <MenuRadioDot />
        </RadixContextMenu.ItemIndicator>
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <MenuShortcut keys={shortcut} />
    </RadixContextMenu.RadioItem>
  );
}

/* Label, Separator, Group */

export type ContextMenuLabelProps = ComponentProps<typeof RadixContextMenu.Label>;

export function ContextMenuLabel({ className, ...props }: ContextMenuLabelProps) {
  return (
    <RadixContextMenu.Label
      data-slot="context-menu-label"
      className={cn(listLabel, className)}
      {...props}
    />
  );
}

export type ContextMenuSeparatorProps = ComponentProps<typeof RadixContextMenu.Separator>;

export function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps) {
  return (
    <RadixContextMenu.Separator
      data-slot="context-menu-separator"
      className={cn(listSeparator, className)}
      {...props}
    />
  );
}

export type ContextMenuGroupProps = ComponentProps<typeof RadixContextMenu.Group>;

export function ContextMenuGroup(props: ContextMenuGroupProps) {
  return <RadixContextMenu.Group data-slot="context-menu-group" {...props} />;
}

/* Sub (ichki menyu) */

export type ContextMenuSubProps = ComponentProps<typeof RadixContextMenu.Sub>;

export function ContextMenuSub(props: ContextMenuSubProps) {
  return <RadixContextMenu.Sub {...props} />;
}

export interface ContextMenuSubTriggerProps extends ComponentProps<
  typeof RadixContextMenu.SubTrigger
> {
  icon?: ReactNode;
}

export function ContextMenuSubTrigger({
  icon,
  className,
  children,
  ...props
}: ContextMenuSubTriggerProps) {
  return (
    <RadixContextMenu.SubTrigger
      data-slot="context-menu-sub-trigger"
      className={cn('group', listItem, menuSubTriggerOpen, className)}
      {...props}
    >
      {icon != null && (
        <span aria-hidden="true" className={menuIconSlot}>
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <span aria-hidden="true" className={cn(menuIconSlot, '-mr-1 ml-auto')}>
        <MenuChevronRightIcon />
      </span>
    </RadixContextMenu.SubTrigger>
  );
}

export interface ContextMenuSubContentProps extends ComponentProps<
  typeof RadixContextMenu.SubContent
> {
  container?: HTMLElement | null;
}

export function ContextMenuSubContent({
  sideOffset = 8,
  alignOffset = -6,
  collisionPadding = 8,
  loop = true,
  container,
  className,
  ...props
}: ContextMenuSubContentProps) {
  const layer = useFloatingLayer();
  return (
    <RadixContextMenu.Portal container={container}>
      <RadixContextMenu.SubContent
        data-slot="context-menu-sub-content"
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        loop={loop}
        className={cn(floatingPanel, layer, contentScroll, className)}
        {...props}
      />
    </RadixContextMenu.Portal>
  );
}

/**
 * O'ng tugma menyusi: `ContextMenu.Trigger`, `ContextMenu.Content`, `ContextMenu.Item` ...
 * API va ko'rinish `DropdownMenu` bilan bir xil. Muhim amallar boshqa yo'l bilan ham
 * (tugma, `DropdownMenu`) mavjud bo'lsin — o'ng tugma menyusini hamma ham topmaydi.
 */
export const ContextMenu = Object.assign(ContextMenuRoot, {
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Item: ContextMenuItem,
  CheckboxItem: ContextMenuCheckboxItem,
  RadioGroup: ContextMenuRadioGroup,
  RadioItem: ContextMenuRadioItem,
  Label: ContextMenuLabel,
  Separator: ContextMenuSeparator,
  Group: ContextMenuGroup,
  Sub: ContextMenuSub,
  SubTrigger: ContextMenuSubTrigger,
  SubContent: ContextMenuSubContent,
});
