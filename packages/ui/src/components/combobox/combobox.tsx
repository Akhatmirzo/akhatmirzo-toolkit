import { normalizeUz, searchMatch, splitByRanges } from '@akhatmirzo/core';
import { useControllableState, useDebouncedCallback } from '@akhatmirzo/hooks';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cva } from 'class-variance-authority';
import { Command } from 'cmdk';
import {
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { useFloatingLayer } from '../../lib/modal-layer';
import { floatingPanel, listItem } from '../../lib/overlay-styles';
import { mergeRefs } from '../../lib/refs';
import { Badge } from '../badge/badge';
import { useFieldControl } from '../field/field';
import { controlContainerBase } from '../input/control-styles';
import { Spinner } from '../spinner/spinner';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface ComboboxLabels {
  /** Qidiruv maydonining aria-label'i */
  search?: string;
  /** Ro'yxatning aria-label'i */
  list?: string;
  /** Yuklanish (Spinner) matni */
  loading?: string;
  /** ✕ (tozalash) tugmasi */
  clear?: string;
  /** Badge'dagi ✕: `(label) => string` */
  remove?: (label: string) => string;
  /** Yaratish elementi: `(matn) => ReactNode` */
  create?: (text: string) => ReactNode;
}

const defaultLabels: Required<ComboboxLabels> = {
  search: 'Qidirish',
  list: 'Variantlar',
  loading: 'Yuklanmoqda',
  clear: 'Tozalash',
  remove: (label) => `Olib tashlash: ${label}`,
  create: (text) => `«${text}» yaratish`,
};

type ComboboxSize = 'sm' | 'md' | 'lg';

interface ComboboxBaseProps extends Omit<
  ComponentProps<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'children' | 'type' | 'prefix'
> {
  options: ComboboxOption[];
  size?: ComboboxSize;
  invalid?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: ReactNode;
  /** Server qidiruvi: so'rov 300ms debounce bilan keladi; mahalliy filtr o'chadi */
  onSearch?: (query: string) => void;
  /** Ro'yxat o'rnida Spinner */
  loading?: boolean;
  /** "+ «matn» yaratish" elementi */
  creatable?: boolean;
  /** Yaratilganda; yangi variantni qaytarsa — u tanlanadi (aks holda matnning o'zi) */
  onCreate?: (text: string) => ComboboxOption | void;
  /** Qiymat bo'lsa ✕ tugmasi */
  clearable?: boolean;
  /** Trigger chap tomonidagi ikonka (`null` — yo'q) */
  leftIcon?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Majburiy maydon (`aria-required`) */
  required?: boolean;
  /** Forma uchun yashirin `<input>` nomi */
  name?: string;
  labels?: ComboboxLabels;
  /** Panel klassi */
  contentClassName?: string;
}

export interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}

export interface ComboboxMultipleProps extends ComboboxBaseProps {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;

const containerVariants = cva(
  [
    controlContainerBase,
    'cursor-pointer items-center gap-2 text-left [&_svg]:shrink-0',
    'data-[state=open]:border-primary! data-[state=open]:shadow-[0_0_0_3px_var(--ak-ring)]',
    'data-invalid:data-[state=open]:border-danger! data-invalid:data-[state=open]:shadow-[0_0_0_3px_var(--ak-danger-ring)]',
  ],
  {
    variants: {
      size: {
        sm: 'min-h-8 px-2.5 text-sm [&_svg]:size-4',
        md: 'min-h-10 px-3 text-sm [&_svg]:size-[18px]',
        lg: 'min-h-12 px-4 text-base [&_svg]:size-5',
      },
      multiple: { true: 'py-1', false: '' },
    },
    compoundVariants: [
      { multiple: true, size: 'sm', className: 'pl-1.5' },
      { multiple: true, size: 'md', className: 'pl-2' },
      { multiple: true, size: 'lg', className: 'pl-2.5' },
    ],
    defaultVariants: { size: 'md', multiple: false },
  },
);

const triggerHeight: Record<ComboboxSize, string> = { sm: 'h-6', md: 'h-7', lg: 'h-8' };

const actionClass =
  'inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-text-muted transition-colors duration-fast ease-out hover:bg-surface-muted hover:text-text focus-ring [&_svg]:size-4!';

/** cmdk `data-disabled="false"` ham chiqaradi — faqat `true` holatini o'chirilgan deb olamiz */
const optionClass = cn(
  listItem.replace(/\bdata-disabled:\S+/g, ''),
  'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
);

const CREATE_VALUE = '\u0000ak-create';

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function SelectorIcon() {
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
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
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

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** Mos kelgan qismlarni qalin qiladi (o'zbekcha normallashtirish bilan) */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const { ranges } = searchMatch(text, query);
  if (ranges.length === 0) return <>{text}</>;
  return (
    <>
      {splitByRanges(text, ranges).map((seg, i) =>
        seg.match ? (
          <mark key={i} className="bg-transparent font-bold text-current">
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}

export function Combobox(props: ComboboxProps) {
  const {
    options,
    multiple = false,
    value: valueProp,
    defaultValue,
    onValueChange,
    size = 'md',
    invalid: invalidProp,
    placeholder = 'Tanlang',
    searchPlaceholder = 'Qidirish...',
    emptyText = 'Hech narsa topilmadi',
    onSearch,
    loading = false,
    creatable = false,
    onCreate,
    clearable = false,
    leftIcon = <SearchIcon />,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    name,
    labels,
    className,
    contentClassName,
    id,
    disabled: disabledProp,
    required: requiredProp,
    ref,
    onKeyDown,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  } = props;

  const layer = useFloatingLayer();
  const field = useFieldControl({
    id,
    invalid: invalidProp,
    required: requiredProp,
    disabled: disabledProp,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  });
  const { invalid, disabled } = field;
  const text = { ...defaultLabels, ...labels };

  const [raw, setRaw] = useControllableState<string | null | string[]>({
    value: valueProp,
    defaultValue: defaultValue ?? (multiple ? [] : null),
    onChange: onValueChange as ((v: string | null | string[]) => void) | undefined,
  });
  const selected = useMemo<string[]>(() => {
    if (Array.isArray(raw)) return raw;
    return raw == null ? [] : [raw];
  }, [raw]);

  const [open, setOpenState] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [query, setQuery] = useState('');
  // Ro'yxatdan chiqib ketgan (server qidiruvi, yaratilgan) tanlovlar nomi uchun
  const [known, setKnown] = useState<Record<string, ComboboxOption>>({});

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const valueId = useId();
  // cmdk ro'yxat id'sini o'zi beradi — trigger'ning aria-controls'i uchun DOM'dan olamiz
  const [listId, setListId] = useState<string | undefined>();
  // Tab bilan yopilganda fokus keyingi maydonga o'tadi — trigger'ga qaytarilmaydi
  const skipReturnFocus = useRef(false);

  const debouncedSearch = useDebouncedCallback((q: string) => onSearch?.(q), 300);

  const changeQuery = (q: string) => {
    setQuery(q);
    if (onSearch) debouncedSearch(q);
  };

  const setOpen = (next: boolean) => {
    if (next && disabled) return;
    setOpenState(next);
    if (!next && query !== '') {
      setQuery('');
      if (onSearch) {
        debouncedSearch.cancel();
        onSearch('');
      }
    }
  };

  const findOption = (v: string): ComboboxOption =>
    options.find((o) => o.value === v) ?? known[v] ?? { value: v, label: v };

  const selectedOptions = selected.map(findOption);

  const commit = (next: string[]) => {
    setRaw(multiple ? next : (next[0] ?? null));
  };

  const remember = (option: ComboboxOption) => {
    setKnown((k) => (k[option.value] === option ? k : { ...k, [option.value]: option }));
  };

  const choose = (option: ComboboxOption) => {
    remember(option);
    if (multiple) {
      commit(
        selected.includes(option.value)
          ? selected.filter((v) => v !== option.value)
          : [...selected, option.value],
      );
    } else {
      commit([option.value]);
      setOpen(false);
    }
  };

  const create = () => {
    const label = query.trim();
    if (!label) return;
    const created = onCreate?.(label) || { value: label, label };
    remember(created);
    if (multiple) {
      if (!selected.includes(created.value)) commit([...selected, created.value]);
      changeQuery('');
    } else {
      commit([created.value]);
      setOpen(false);
    }
  };

  const removeValue = (v: string) => {
    commit(selected.filter((s) => s !== v));
  };

  const trimmed = query.trim();
  const filtered = onSearch
    ? options
    : options.filter(
        (o) => searchMatch(o.label, trimmed).match || searchMatch(o.description, trimmed).match,
      );
  const showCreate =
    creatable &&
    trimmed !== '' &&
    !loading &&
    !options.some((o) => normalizeUz(o.label) === normalizeUz(trimmed));

  // --- Trigger hodisalari ---

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === 'Backspace' && multiple && selected.length > 0 && !open) {
      e.preventDefault();
      removeValue(selected[selected.length - 1]!);
    } else if (
      e.key.length === 1 &&
      e.key !== ' ' &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      !open
    ) {
      // Yopiq holda yozish — ochib, qidiruvni shu harfdan boshlaydi
      e.preventDefault();
      changeQuery(e.key);
      setOpen(true);
    }
  };

  // Konteynerning bo'sh joyiga (badge'lar orasi, chevron) bosilganda
  const handleContainerClick = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    if ((e.target as HTMLElement).closest('button')) return;
    triggerRef.current?.focus();
    setOpen(!open);
  };

  // --- Qidiruv maydoni ---

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && query === '' && multiple && selected.length > 0) {
      e.preventDefault();
      removeValue(selected[selected.length - 1]!);
    } else if (e.key === 'Tab') {
      // preventDefault yo'q: fokus trigger'ga qo'yiladi, brauzer Tab'i undan keyingi elementga o'tadi
      skipReturnFocus.current = true;
      triggerRef.current?.focus();
      setOpen(false);
    }
  };

  const hasValue = selected.length > 0;
  const canClear = clearable && hasValue && !disabled;
  const single = !multiple ? selectedOptions[0] : undefined;

  const valueText = selectedOptions.map((o) => o.label).join(', ');
  const labelledBy =
    ariaLabelledBy ??
    (!ariaLabel && field.labelId
      ? hasValue
        ? `${field.labelId} ${valueId}`
        : field.labelId
      : undefined);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Anchor asChild>
        <div
          ref={containerRef}
          data-slot="combobox"
          data-size={size}
          data-state={open ? 'open' : 'closed'}
          data-invalid={invalid ? '' : undefined}
          data-disabled={disabled ? '' : undefined}
          className={cn(containerVariants({ size, multiple }), className)}
          onClick={handleContainerClick}
        >
          {leftIcon != null && leftIcon !== false && (
            <span aria-hidden="true" className="flex shrink-0 text-text-muted">
              {leftIcon}
            </span>
          )}
          <div
            className={cn(
              'flex min-w-0 flex-1 items-center gap-1.5',
              multiple && 'flex-wrap py-0.5',
            )}
          >
            {multiple &&
              selectedOptions.map((o) => (
                <Badge
                  key={o.value}
                  color="neutral"
                  className="max-w-40"
                  onRemove={
                    disabled
                      ? undefined
                      : (e) => {
                          e.stopPropagation();
                          removeValue(o.value);
                        }
                  }
                  labels={{ remove: text.remove(o.label) }}
                >
                  {o.label}
                </Badge>
              ))}
            <PopoverPrimitive.Trigger asChild>
              <button
                ref={mergeRefs(triggerRef, ref)}
                type="button"
                role="combobox"
                aria-haspopup="listbox"
                aria-controls={open ? listId : undefined}
                aria-label={ariaLabel}
                aria-labelledby={labelledBy}
                disabled={disabled}
                data-placeholder={hasValue ? undefined : ''}
                onKeyDown={handleTriggerKeyDown}
                className={cn(
                  'flex min-w-0 flex-1 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left font-sans text-text outline-none disabled:cursor-not-allowed',
                  multiple ? cn(triggerHeight[size], 'min-w-12') : 'self-stretch',
                )}
                {...field.controlProps}
                {...rest}
              >
                <span id={valueId} className="flex min-w-0 flex-1 items-center gap-2">
                  {!hasValue && <span className="truncate text-text-faint">{placeholder}</span>}
                  {single && (
                    <>
                      {single.icon && (
                        <span aria-hidden="true" className="flex shrink-0 text-text-muted">
                          {single.icon}
                        </span>
                      )}
                      <span className="truncate">{single.label}</span>
                    </>
                  )}
                  {multiple && hasValue && <span className="sr-only">{valueText}</span>}
                </span>
              </button>
            </PopoverPrimitive.Trigger>
          </div>
          {canClear && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={text.clear}
              className={cn(actionClass, '-mr-1')}
              onClick={(e) => {
                e.stopPropagation();
                commit([]);
                triggerRef.current?.focus();
              }}
            >
              <XIcon />
            </button>
          )}
          <span aria-hidden="true" className="flex shrink-0 text-text-muted">
            <SelectorIcon />
          </span>
          {name && selected.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
        </div>
      </PopoverPrimitive.Anchor>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-slot="combobox-content"
          align="start"
          sideOffset={6}
          collisionPadding={8}
          aria-label={text.list}
          className={cn(
            floatingPanel,
            layer,
            'flex w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) flex-col',
            'max-h-(--radix-popover-content-available-height)',
            contentClassName,
          )}
          onEscapeKeyDown={(e) => {
            // Esc: avval qidiruvni tozalaydi, keyin yopadi
            if (query !== '') {
              e.preventDefault();
              changeQuery('');
            }
          }}
          onCloseAutoFocus={(e) => {
            if (skipReturnFocus.current) {
              skipReturnFocus.current = false;
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            // Konteynerga bosish o'zi ochib/yopadi
            if (containerRef.current?.contains(e.target as Node)) e.preventDefault();
          }}
        >
          <Command
            shouldFilter={false}
            loop
            label={text.search}
            defaultValue={!multiple && single ? single.value : undefined}
            className="flex min-h-0 flex-col outline-none"
          >
            <div className="-mx-1.5 mb-1.5 flex items-center gap-2 border-b border-border px-2.5 pt-0.5 pb-1.5 text-text-muted [&_svg]:size-4">
              <SearchIcon />
              <Command.Input
                value={query}
                onValueChange={changeQuery}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder}
                className="h-8 min-w-0 flex-1 border-0 bg-transparent p-0 font-sans text-sm text-text outline-none placeholder:text-text-faint"
              />
            </div>
            <Command.List
              ref={(el) => setListId(el?.id || undefined)}
              label={text.list}
              aria-multiselectable={multiple || undefined}
              className="max-h-[min(20rem,calc(var(--radix-popover-content-available-height)-3.5rem))] overflow-y-auto overscroll-contain"
            >
              {loading ? (
                <div className="flex justify-center py-6 text-text-muted">
                  <Spinner size="sm" label={text.loading} />
                </div>
              ) : (
                <>
                  {filtered.length === 0 && (
                    <div
                      data-slot="combobox-empty"
                      className="px-2 py-4 text-center text-sm text-text-muted"
                    >
                      {emptyText}
                    </div>
                  )}
                  {filtered.map((option) => {
                    const checked = selected.includes(option.value);
                    return (
                      <Command.Item
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        aria-checked={checked}
                        data-checked={checked ? '' : undefined}
                        onSelect={() => choose(option)}
                        className={cn(optionClass, option.description && 'h-auto min-h-9 py-1.5')}
                      >
                        {option.icon && (
                          <span aria-hidden="true" className="flex shrink-0 text-text-muted">
                            {option.icon}
                          </span>
                        )}
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate">
                            <Highlight text={option.label} query={trimmed} />
                          </span>
                          {option.description && (
                            <span className="truncate text-xs text-text-muted">
                              <Highlight text={option.description} query={trimmed} />
                            </span>
                          )}
                        </span>
                        {checked && (
                          <span className="ml-auto flex shrink-0 text-primary">
                            <CheckIcon />
                          </span>
                        )}
                      </Command.Item>
                    );
                  })}
                  {showCreate && (
                    <Command.Item
                      value={CREATE_VALUE}
                      onSelect={create}
                      className={cn(optionClass, 'text-primary-soft-foreground')}
                    >
                      <PlusIcon />
                      <span className="truncate">{text.create(trimmed)}</span>
                    </Command.Item>
                  )}
                </>
              )}
            </Command.List>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
