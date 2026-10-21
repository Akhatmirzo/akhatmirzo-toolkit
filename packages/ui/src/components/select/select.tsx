import * as RadixSelect from '@radix-ui/react-select';
import { cva } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { useFloatingLayer } from '../../lib/modal-layer';
import { floatingPanel, listItem, listLabel, listSeparator } from '../../lib/overlay-styles';
import { useFieldControl } from '../field/field';
import { controlContainerBase } from '../input/control-styles';

function ChevronIcon({ up = false, className }: { up?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={up ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
    </svg>
  );
}

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

/* Trigger — Input bilan bir xil konteyner */
const triggerVariants = cva(
  [
    controlContainerBase,
    'group cursor-pointer items-center gap-2 text-left outline-none select-none [&_svg]:shrink-0',
    // Ochiq holatda fokus panelda — halqa trigger'da qoladi
    'data-[state=open]:border-primary data-[state=open]:shadow-[0_0_0_3px_var(--ak-ring)]',
    'data-invalid:data-[state=open]:border-danger data-invalid:data-[state=open]:shadow-[0_0_0_3px_var(--ak-danger-ring)]',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 px-2.5 text-sm [&_svg]:size-4',
        md: 'h-10 px-3 text-sm [&_svg]:size-[18px]',
        lg: 'h-12 px-4 text-base [&_svg]:size-5',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

const scrollButton = 'flex h-6 shrink-0 cursor-default items-center justify-center text-text-muted';

export type SelectSize = 'sm' | 'md' | 'lg';

type RootProps = ComponentProps<typeof RadixSelect.Root>;

export interface SelectProps extends Omit<
  ComponentProps<'button'>,
  'value' | 'defaultValue' | 'dir'
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Qiymat tanlanmaganda ko'rinadigan matn */
  placeholder?: ReactNode;
  size?: SelectSize;
  /** Xato holati (Field ichida `error` bo'lsa avtomatik) */
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  /** Forma uchun (yashirin native select) */
  name?: string;
  autoComplete?: string;
  dir?: RootProps['dir'];
  /** Panel klassi (`className` — trigger'ga) */
  contentClassName?: string;
  /** Portal konteyneri (default — `document.body`) */
  container?: HTMLElement | null;
  children: ReactNode;
}

function SelectRoot({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  placeholder = 'Tanlang',
  size = 'md',
  invalid: invalidProp,
  disabled: disabledProp,
  required: requiredProp,
  name,
  autoComplete,
  dir,
  id,
  className,
  contentClassName,
  container,
  children,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: SelectProps) {
  const layer = useFloatingLayer();
  const field = useFieldControl({
    id,
    invalid: invalidProp,
    required: requiredProp,
    disabled: disabledProp,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  });
  const { invalid, disabled, required } = field;

  return (
    <RadixSelect.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      disabled={disabled}
      required={required}
      name={name}
      autoComplete={autoComplete}
      dir={dir}
    >
      <RadixSelect.Trigger
        data-slot="select-trigger"
        data-size={size}
        data-invalid={invalid ? '' : undefined}
        className={cn(triggerVariants({ size }), className)}
        {...field.controlProps}
        {...props}
      >
        <span className="min-w-0 flex-1 truncate text-text group-data-placeholder:text-text-faint">
          <RadixSelect.Value placeholder={placeholder} />
        </span>
        <RadixSelect.Icon asChild>
          <span className="flex text-text-muted transition-transform duration-moderate ease-out group-data-[state=open]:rotate-180 motion-reduce:transition-none">
            <ChevronIcon />
          </span>
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal container={container}>
        <RadixSelect.Content
          data-slot="select-content"
          position="popper"
          side="bottom"
          sideOffset={6}
          collisionPadding={8}
          className={cn(
            floatingPanel,
            layer,
            'flex w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width) flex-col',
            'max-h-[min(20rem,var(--radix-select-content-available-height))]',
            contentClassName,
          )}
        >
          <RadixSelect.ScrollUpButton className={scrollButton}>
            <ChevronIcon up className="size-4" />
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport>{children}</RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className={scrollButton}>
            <ChevronIcon className="size-4" />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

/* Item */

export interface SelectItemProps extends ComponentProps<typeof RadixSelect.Item> {
  /** Chapdagi ikonka (16px) */
  icon?: ReactNode;
}

export function SelectItem({ icon, className, children, ...props }: SelectItemProps) {
  return (
    <RadixSelect.Item
      data-slot="select-item"
      className={cn('group', listItem, className)}
      {...props}
    >
      {icon != null && (
        <span
          aria-hidden="true"
          className="flex size-4 shrink-0 items-center justify-center text-text-muted group-data-highlighted:text-current"
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">
        <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      </span>
      <RadixSelect.ItemIndicator className="ml-auto flex text-primary">
        <CheckIcon />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
}

/* Group, Separator */

export interface SelectGroupProps extends ComponentProps<typeof RadixSelect.Group> {
  /** Guruh sarlavhasi */
  label?: ReactNode;
}

export function SelectGroup({ label, children, ...props }: SelectGroupProps) {
  return (
    <RadixSelect.Group data-slot="select-group" {...props}>
      {label != null && <RadixSelect.Label className={listLabel}>{label}</RadixSelect.Label>}
      {children}
    </RadixSelect.Group>
  );
}

export type SelectSeparatorProps = ComponentProps<typeof RadixSelect.Separator>;

export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <RadixSelect.Separator
      data-slot="select-separator"
      className={cn(listSeparator, className)}
      {...props}
    />
  );
}

/** Qidiruvsiz tanlash ro'yxati. Qidiruv kerak bo'lsa — Combobox */
export const Select = Object.assign(SelectRoot, {
  Item: SelectItem,
  Group: SelectGroup,
  Separator: SelectSeparator,
});
