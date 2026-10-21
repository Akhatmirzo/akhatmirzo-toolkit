import { useFloatingLayer } from '../../lib/modal-layer';
import { useControllableState } from '@akhatmirzo/hooks';
import * as RadixMenu from '@radix-ui/react-dropdown-menu';
import {
  Children,
  cloneElement,
  isValidElement,
  useSyncExternalStore,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import {
  floatingPanel,
  listItem,
  listItemDanger,
  listLabel,
  listSeparator,
} from '../../lib/overlay-styles';
import { buttonVariants } from '../button';
import { isApplePlatform, Kbd } from '../kbd/kbd';

/* Ichki ikonkalar */

function CheckIcon() {
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

function ChevronRightIcon() {
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

const subscribe = () => () => {};

/** `["mod", "E"]` → `aria-keyshortcuts="Control+E"` (macOS'da `Meta+E`) */
function useKeyShortcuts(keys?: string[]) {
  const apple = useSyncExternalStore(subscribe, isApplePlatform, () => false);
  if (!keys?.length) return undefined;
  return keys.map((k) => (k.toLowerCase() === 'mod' ? (apple ? 'Meta' : 'Control') : k)).join('+');
}

const iconSlot =
  'flex size-4 shrink-0 items-center justify-center text-text-muted group-data-highlighted:text-current';

/* Root */

export type DropdownMenuProps = ComponentProps<typeof RadixMenu.Root>;

function DropdownMenuRoot(props: DropdownMenuProps) {
  return <RadixMenu.Root {...props} />;
}

/* Trigger */

export type DropdownMenuTriggerProps = ComponentProps<typeof RadixMenu.Trigger>;

/** `asChild` bo'lmasa — `outline` tugma ko'rinishida */
export function DropdownMenuTrigger({ asChild, className, ...props }: DropdownMenuTriggerProps) {
  return (
    <RadixMenu.Trigger
      data-slot="dropdown-menu-trigger"
      asChild={asChild}
      className={asChild ? className : cn(buttonVariants({ variant: 'outline' }), className)}
      {...props}
    />
  );
}

/* Content */

export interface DropdownMenuContentProps extends ComponentProps<typeof RadixMenu.Content> {
  /** Portal konteyneri (default — `document.body`) */
  container?: HTMLElement | null;
}

export function DropdownMenuContent({
  align = 'start',
  side = 'bottom',
  sideOffset = 6,
  collisionPadding = 8,
  loop = true,
  container,
  className,
  ...props
}: DropdownMenuContentProps) {
  const layer = useFloatingLayer();
  return (
    <RadixMenu.Portal container={container}>
      <RadixMenu.Content
        data-slot="dropdown-menu-content"
        align={align}
        side={side}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        loop={loop}
        className={cn(
          floatingPanel,
          layer,
          'max-h-(--radix-dropdown-menu-content-available-height) overflow-y-auto',
          className,
        )}
        {...props}
      />
    </RadixMenu.Portal>
  );
}

/* Item */

export interface DropdownMenuItemProps extends ComponentProps<typeof RadixMenu.Item> {
  /** Chapdagi ikonka (16px) */
  icon?: ReactNode;
  /** O'ngdagi klaviatura yorlig'i, masalan `["mod", "E"]` */
  shortcut?: string[];
  variant?: 'default' | 'danger';
}

export function DropdownMenuItem({
  icon,
  shortcut,
  variant = 'default',
  asChild,
  className,
  children,
  ...props
}: DropdownMenuItemProps) {
  const danger = variant === 'danger';
  const keyShortcuts = useKeyShortcuts(shortcut);

  const decorate = (content: ReactNode) => (
    <>
      {icon != null && (
        <span aria-hidden="true" className={cn(iconSlot, danger && 'text-current')}>
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{content}</span>
      {shortcut && shortcut.length > 0 && (
        <Kbd keys={shortcut} aria-hidden="true" className="ml-auto" />
      )}
    </>
  );

  // asChild: bolaning (masalan <a>) ichiga ikonka va yorliq qo'shiladi
  let body: ReactNode;
  if (asChild) {
    const child = Children.only(children) as ReactElement<{ children?: ReactNode }>;
    body = isValidElement(child)
      ? cloneElement(child, undefined, decorate(child.props.children))
      : child;
  } else {
    body = decorate(children);
  }

  return (
    <RadixMenu.Item
      data-slot="dropdown-menu-item"
      data-variant={variant}
      aria-keyshortcuts={keyShortcuts}
      asChild={asChild}
      className={cn('group', listItem, danger && listItemDanger, className)}
      {...props}
    >
      {body}
    </RadixMenu.Item>
  );
}

/* CheckboxItem */

export interface DropdownMenuCheckboxItemProps extends ComponentProps<
  typeof RadixMenu.CheckboxItem
> {
  shortcut?: string[];
}

export function DropdownMenuCheckboxItem({
  shortcut,
  className,
  children,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const keyShortcuts = useKeyShortcuts(shortcut);
  return (
    <RadixMenu.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      aria-keyshortcuts={keyShortcuts}
      className={cn('group', listItem, className)}
      {...props}
    >
      <span className="flex size-4 shrink-0 items-center justify-center text-primary group-data-highlighted:text-current">
        <RadixMenu.ItemIndicator className="flex">
          <CheckIcon />
        </RadixMenu.ItemIndicator>
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {shortcut && shortcut.length > 0 && (
        <Kbd keys={shortcut} aria-hidden="true" className="ml-auto" />
      )}
    </RadixMenu.CheckboxItem>
  );
}

/* RadioGroup + RadioItem */

export interface DropdownMenuRadioGroupProps extends ComponentProps<typeof RadixMenu.RadioGroup> {
  /** Boshqarilmaydigan rejim uchun boshlang'ich qiymat */
  defaultValue?: string;
}

export function DropdownMenuRadioGroup({
  value: valueProp,
  defaultValue,
  onValueChange,
  ...props
}: DropdownMenuRadioGroupProps) {
  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });
  return (
    <RadixMenu.RadioGroup
      data-slot="dropdown-menu-radio-group"
      value={value}
      onValueChange={setValue}
      {...props}
    />
  );
}

export interface DropdownMenuRadioItemProps extends ComponentProps<typeof RadixMenu.RadioItem> {
  shortcut?: string[];
}

export function DropdownMenuRadioItem({
  shortcut,
  className,
  children,
  ...props
}: DropdownMenuRadioItemProps) {
  const keyShortcuts = useKeyShortcuts(shortcut);
  return (
    <RadixMenu.RadioItem
      data-slot="dropdown-menu-radio-item"
      aria-keyshortcuts={keyShortcuts}
      className={cn('group', listItem, className)}
      {...props}
    >
      <span className="flex size-4 shrink-0 items-center justify-center text-primary group-data-highlighted:text-current">
        <RadixMenu.ItemIndicator className="flex">
          <span className="size-2 rounded-full bg-current" />
        </RadixMenu.ItemIndicator>
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {shortcut && shortcut.length > 0 && (
        <Kbd keys={shortcut} aria-hidden="true" className="ml-auto" />
      )}
    </RadixMenu.RadioItem>
  );
}

/* Label, Separator, Group */

export type DropdownMenuLabelProps = ComponentProps<typeof RadixMenu.Label>;

export function DropdownMenuLabel({ className, ...props }: DropdownMenuLabelProps) {
  return (
    <RadixMenu.Label
      data-slot="dropdown-menu-label"
      className={cn(listLabel, className)}
      {...props}
    />
  );
}

export type DropdownMenuSeparatorProps = ComponentProps<typeof RadixMenu.Separator>;

export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return (
    <RadixMenu.Separator
      data-slot="dropdown-menu-separator"
      className={cn(listSeparator, className)}
      {...props}
    />
  );
}

export type DropdownMenuGroupProps = ComponentProps<typeof RadixMenu.Group>;

export function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <RadixMenu.Group data-slot="dropdown-menu-group" {...props} />;
}

/* Sub (ichki menyu) */

export type DropdownMenuSubProps = ComponentProps<typeof RadixMenu.Sub>;

export function DropdownMenuSub(props: DropdownMenuSubProps) {
  return <RadixMenu.Sub {...props} />;
}

export interface DropdownMenuSubTriggerProps extends ComponentProps<typeof RadixMenu.SubTrigger> {
  icon?: ReactNode;
}

export function DropdownMenuSubTrigger({
  icon,
  className,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <RadixMenu.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      className={cn(
        'group',
        listItem,
        'data-[state=open]:bg-primary-soft data-[state=open]:text-primary-soft-foreground',
        className,
      )}
      {...props}
    >
      {icon != null && (
        <span aria-hidden="true" className={iconSlot}>
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <span aria-hidden="true" className={cn(iconSlot, '-mr-1 ml-auto')}>
        <ChevronRightIcon />
      </span>
    </RadixMenu.SubTrigger>
  );
}

export interface DropdownMenuSubContentProps extends ComponentProps<typeof RadixMenu.SubContent> {
  container?: HTMLElement | null;
}

export function DropdownMenuSubContent({
  sideOffset = 8,
  alignOffset = -6,
  collisionPadding = 8,
  loop = true,
  container,
  className,
  ...props
}: DropdownMenuSubContentProps) {
  const layer = useFloatingLayer();
  return (
    <RadixMenu.Portal container={container}>
      <RadixMenu.SubContent
        data-slot="dropdown-menu-sub-content"
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        loop={loop}
        className={cn(
          floatingPanel,
          layer,
          'max-h-(--radix-dropdown-menu-content-available-height) overflow-y-auto',
          className,
        )}
        {...props}
      />
    </RadixMenu.Portal>
  );
}

/** Amallar menyusi: `DropdownMenu.Trigger`, `DropdownMenu.Content`, `DropdownMenu.Item` ... */
export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
  Group: DropdownMenuGroup,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
});
