import { formatDate, parseDate } from '@akhatmirzo/core';
import { useControllableState } from '@akhatmirzo/hooks';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cva } from 'class-variance-authority';
import { addDays, startOfDay, startOfMonth } from 'date-fns';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { useFloatingLayer } from '../../lib/modal-layer';
import { floatingContentPanel } from '../../lib/overlay-styles';
import { mergeRefs } from '../../lib/refs';
import { Button } from '../button';
import { useFieldControl } from '../field/field';
import { controlContainerBase, controlElementBase } from '../input/control-styles';
import { Calendar, focusCalendarDay, type CalendarLabels, type CalendarView } from './calendar';
import {
  applyMask,
  buildMask,
  caretAfterDigits,
  countDigits,
  defaultDatePresets,
  formatPlaceholder,
  isDateSelectable,
  type DateConstraints,
  type DatePreset,
  type DatePresetLabels,
} from './date-utils';

/* ---------- Umumiy qismlar (DateRangePicker ham ishlatadi) ---------- */

export type DatePickerSize = 'sm' | 'md' | 'lg';

export const pickerContainerVariants = cva(
  [controlContainerBase, 'items-center gap-2 [&_svg]:shrink-0'],
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

export const pickerActionVariants = cva(
  [
    'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-text-muted',
    'transition-colors duration-fast ease-out hover:bg-surface-muted hover:text-text focus-ring',
    'disabled:cursor-not-allowed disabled:hover:bg-transparent',
  ],
  {
    variants: {
      size: {
        sm: 'size-6',
        md: 'size-7',
        lg: 'size-8',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

/** Kalendar paneli: Popover ko'rinishi, ichki padding 12px */
export const pickerContentClass = cn(
  floatingContentPanel,
  'w-auto max-w-[calc(100vw-16px)] p-3',
  'max-h-(--radix-popover-content-available-height) overflow-y-auto',
);

export const presetsRowClass =
  '-mx-3 mt-3 flex flex-wrap items-center gap-1.5 border-t border-border px-3 pt-3';

export function CalendarIcon() {
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
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

export function ChevronDownIcon() {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function XIcon() {
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

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-3.5 shrink-0"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

const timeOf = (d: Date | null | undefined) => (d ? d.getTime() : null);

/* ---------- DatePicker ---------- */

export type DatePickerError = 'invalid' | 'unavailable';

export interface DatePickerLabels extends CalendarLabels, DatePresetLabels {
  /** Default — shablondan: `kk.oo.yyyy` */
  placeholder?: string;
  openCalendar?: string;
  calendar?: string;
  clear?: string;
  presets?: string;
  invalidDate?: string;
  unavailableDate?: string;
}

const defaultLabels = {
  openCalendar: 'Kalendarni ochish',
  calendar: 'Kalendar',
  clear: 'Tozalash',
  presets: 'Tezkor tanlash',
  invalidDate: "Bunday sana yo'q",
  unavailableDate: "Bu sanani tanlab bo'lmaydi",
  today: 'Bugun',
  tomorrow: 'Ertaga',
  inAWeek: 'Bir haftadan keyin',
};

export interface DatePickerProps
  extends
    DateConstraints,
    Omit<
      ComponentProps<'input'>,
      'value' | 'defaultValue' | 'onChange' | 'size' | 'prefix' | 'type' | 'min' | 'max'
    > {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  /** Ko'rsatish va yozish shabloni (`@akhatmirzo/core` formatDate tokenlari) */
  format?: string;
  /** Tayyor variantlar: `true` — "Bugun", "Ertaga", "Bir haftadan keyin" */
  presets?: boolean | DatePreset[];
  size?: DatePickerSize;
  /** Xato holati (Field ichida `error` bo'lsa avtomatik) */
  invalid?: boolean;
  /** Qiymat bo'lsa ✕ tugmasi */
  clearable?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Bugungi sana (default — `new Date()`) */
  today?: Date;
  numberOfMonths?: number;
  /** Yozilgan matn xatosi o'zgarganda: noto'g'ri sana yoki tanlab bo'lmaydigan sana */
  onErrorChange?: (error: DatePickerError | null) => void;
  /**
   * Ichki xato matnini ko'rsatish. Default — tashqi xato (Field `error` yoki `invalid`) bo'lmasa;
   * aks holda ikki qator xato chiqmasligi uchun yashiriladi (xato `onErrorChange` orqali keladi).
   */
  showError?: boolean;
  labels?: DatePickerLabels;
  /** Ichki `<input>` klassi (`className` — ildizga) */
  inputClassName?: string;
  contentClassName?: string;
}

/**
 * Sana tanlash: Input ko'rinishidagi maydon (qo'lda yozish + `__.__.____` niqob) va Popover'da
 * kalendar. `↓` — kalendarga o'tish, `Esc` — yopish.
 */
export function DatePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  minDate,
  maxDate,
  disabledDates,
  format = 'dd.MM.yyyy',
  presets,
  size = 'md',
  invalid: invalidProp,
  clearable = false,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  today: todayProp,
  numberOfMonths = 1,
  onErrorChange,
  showError: showErrorProp,
  labels,
  className,
  inputClassName,
  contentClassName,
  id,
  name,
  placeholder,
  disabled: disabledProp,
  required: requiredProp,
  readOnly = false,
  onFocus,
  onBlur,
  onKeyDown,
  onClick,
  ref,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: DatePickerProps) {
  const field = useFieldControl({
    id,
    invalid: invalidProp,
    required: requiredProp,
    disabled: disabledProp,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  });
  const { disabled } = field;
  const text = { ...defaultLabels, ...labels };
  const constraints: DateConstraints = { minDate, maxDate, disabledDates };
  const today = startOfDay(todayProp ?? new Date());
  const layer = useFloatingLayer();

  const [value, setValue] = useControllableState<Date | null>({
    value: valueProp,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  });
  const [open, setOpenState] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const mask = useMemo(() => buildMask(format), [format]);
  const [inputText, setInputText] = useState(() => (value ? formatDate(value, format) : ''));
  const [error, setError] = useState<DatePickerError | null>(null);
  const [month, setMonth] = useState(() => startOfMonth(value ?? today));
  const [view, setView] = useState<CalendarView>('days');
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<number | null>(null);
  const suppressOpenRef = useRef(false);
  const focusCalendarRef = useRef(false);
  const errorRef = useRef<DatePickerError | null>(null);
  const contentId = useId();
  const errorId = useId();

  // Matn qaysi qiymatga mos — qiymat tashqaridan o'zgarsa matn yangilanadi
  const [synced, setSynced] = useState<Date | null>(value);
  if (timeOf(synced) !== timeOf(value)) {
    setSynced(value);
    setInputText(value ? formatDate(value, format) : '');
    setError(null);
    if (value) setMonth(startOfMonth(value));
  }

  useEffect(() => {
    if (errorRef.current === error) return;
    errorRef.current = error;
    onErrorChange?.(error);
  }, [error, onErrorChange]);

  useLayoutEffect(() => {
    const pos = caretRef.current;
    const el = inputRef.current;
    if (pos == null || !el) return;
    caretRef.current = null;
    if (document.activeElement === el) el.setSelectionRange(pos, pos);
  });

  const commit = (date: Date | null) => {
    setSynced(date);
    setValue(date);
  };

  const setOpen = (next: boolean) => {
    if (next && (disabled || readOnly)) return;
    if (!next) setView('days');
    setOpenState(next);
  };

  const openPopover = (focusCalendar: boolean) => {
    if (disabled || readOnly) return;
    focusCalendarRef.current = focusCalendar;
    setMonth(startOfMonth(value ?? today));
    setView('days');
    setOpen(true);
  };

  const focusInput = () => {
    const el = inputRef.current;
    if (!el) return;
    if (document.activeElement !== el) {
      suppressOpenRef.current = true;
      el.focus();
    }
    caretRef.current = el.value.length;
  };

  /** To'liq yozilgan matnni tekshiradi; to'g'ri bo'lsa qiymatga yozadi */
  const evaluate = (raw: string) => {
    const date = parseDate(raw, format);
    if (!date) {
      setError('invalid');
      return false;
    }
    if (!isDateSelectable(date, constraints)) {
      setError('unavailable');
      return false;
    }
    setError(null);
    commit(date);
    setMonth(startOfMonth(date));
    return true;
  };

  const updateText = (next: string) => {
    setInputText(next);
    if (next === '') {
      setError(null);
      if (value) commit(null);
      return;
    }
    if (mask && next.length === mask.length) evaluate(next);
    else setError(null);
  };

  const pick = (date: Date) => {
    setInputText(formatDate(date, format));
    setError(null);
    commit(date);
    setOpen(false);
    focusInput();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    let next = el.value;
    if (mask) {
      const caret = el.selectionStart ?? next.length;
      const digitsBefore = countDigits(next.slice(0, caret));
      const digits = next.replace(/\D/g, '').slice(0, mask.split('_').length - 1);
      next = applyMask(digits, mask);
      caretRef.current = caretAfterDigits(next, Math.min(digitsBefore, digits.length));
    }
    updateText(next);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || disabled || readOnly) return;
    const el = e.currentTarget;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (open) focusCalendarDay(contentRef.current);
      else openPopover(true);
      return;
    }

    if (e.key === 'Enter') {
      if (!inputText) return;
      e.preventDefault();
      if (evaluate(inputText)) setOpen(false);
      return;
    }

    // Backspace doimiy belgini (nuqta) emas, undan oldingi raqamni o'chiradi
    if (mask && e.key === 'Backspace') {
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      if (start !== end || start === 0 || /\d/.test(el.value[start - 1] ?? '')) return;
      e.preventDefault();
      let idx = start - 1;
      while (idx >= 0 && !/\d/.test(el.value[idx] ?? '')) idx--;
      if (idx < 0) return;
      const digits = (el.value.slice(0, idx) + el.value.slice(idx + 1)).replace(/\D/g, '');
      const next = applyMask(digits, mask);
      caretRef.current = caretAfterDigits(next, countDigits(el.value.slice(0, idx)));
      updateText(next);
    }
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    onFocus?.(e);
    setFocused(true);
    if (suppressOpenRef.current) {
      suppressOpenRef.current = false;
      return;
    }
    if (!open) openPopover(false);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
    setFocused(false);
    suppressOpenRef.current = false;
    const to = e.relatedTarget as Node | null;
    if (to && (contentRef.current?.contains(to) || containerRef.current?.contains(to))) return;
    if (!inputText) return;
    if (
      mask ? inputText.length < mask.length : timeOf(parseDate(inputText, format)) !== timeOf(value)
    ) {
      if (mask) setError('invalid');
      else evaluate(inputText);
    }
  };

  const handleClick = (e: MouseEvent<HTMLInputElement>) => {
    onClick?.(e);
    if (!open) openPopover(false);
  };

  // Konteynerning bo'sh joyiga bosilganda fokus input'ga o'tadi
  const handleContainerMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (disabled || target === inputRef.current || target.closest('button')) return;
    e.preventDefault();
    inputRef.current?.focus();
  };

  const clear = () => {
    setInputText('');
    setError(null);
    commit(null);
    inputRef.current?.focus();
  };

  const presetList: DatePreset[] =
    presets === true ? defaultDatePresets(text) : Array.isArray(presets) ? presets : [];

  /** Variant sanasi tanlab bo'lmasa — eng yaqin ruxsat etilgan keyingi kun (31 kungacha) */
  const resolvePreset = (preset: DatePreset) => {
    let date = startOfDay(typeof preset.date === 'function' ? preset.date(today) : preset.date);
    for (let i = 0; i <= 31; i++) {
      if (isDateSelectable(date, constraints)) return date;
      date = addDays(date, 1);
    }
    return null;
  };

  const footer: ReactNode =
    presetList.length > 0 ? (
      <div
        data-slot="calendar-footer"
        role="group"
        aria-label={text.presets}
        className={presetsRowClass}
      >
        {presetList.map((preset) => {
          const date = resolvePreset(preset);
          return (
            <Button
              key={preset.label}
              size="sm"
              variant="soft"
              disabled={!date}
              onClick={() => date && pick(date)}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>
    ) : null;

  const invalid = field.invalid || error !== null;
  const showError = (showErrorProp ?? !field.invalid) && error !== null;
  const describedBy =
    [field.controlProps['aria-describedby'], showError ? errorId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;
  const canClear = clearable && inputText !== '' && !disabled && !readOnly;
  const showMask = Boolean(mask && focused && inputText && inputText.length < (mask?.length ?? 0));

  return (
    <div
      data-slot="date-picker"
      className={cn('flex w-full flex-col gap-1.5 bg-transparent font-sans text-text', className)}
    >
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Anchor asChild>
          <div
            ref={containerRef}
            data-slot="date-picker-control"
            data-size={size}
            data-state={open ? 'open' : 'closed'}
            data-invalid={invalid ? '' : undefined}
            data-disabled={disabled ? '' : undefined}
            data-readonly={readOnly ? '' : undefined}
            className={cn(pickerContainerVariants({ size }), 'cursor-text')}
            onMouseDown={handleContainerMouseDown}
          >
            <span aria-hidden="true" className="flex shrink-0 text-text-muted">
              <CalendarIcon />
            </span>
            <div className="relative flex min-w-0 flex-1 self-stretch">
              {showMask && (
                <span
                  aria-hidden="true"
                  data-slot="date-picker-mask"
                  className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre tabular-nums"
                >
                  <span className="invisible">{inputText}</span>
                  <span className="text-text-faint">{mask?.slice(inputText.length)}</span>
                </span>
              )}
              <input
                ref={mergeRefs(inputRef, ref)}
                type="text"
                inputMode={mask ? 'numeric' : undefined}
                autoComplete="off"
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={open ? contentId : undefined}
                placeholder={placeholder ?? text.placeholder ?? formatPlaceholder(format)}
                value={inputText}
                disabled={disabled}
                readOnly={readOnly}
                required={requiredProp}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onClick={handleClick}
                className={cn(controlElementBase, 'relative h-full tabular-nums', inputClassName)}
                {...field.controlProps}
                aria-invalid={invalid ? true : undefined}
                aria-describedby={describedBy}
                {...props}
              />
            </div>
            {canClear && (
              <button
                type="button"
                tabIndex={-1}
                aria-label={text.clear}
                className={pickerActionVariants({ size })}
                onMouseDown={(e) => e.preventDefault()}
                onClick={clear}
              >
                <XIcon />
              </button>
            )}
            <button
              type="button"
              aria-label={text.openCalendar}
              aria-expanded={open}
              aria-haspopup="dialog"
              disabled={disabled || readOnly}
              className={cn(pickerActionVariants({ size }), '-mr-1.5')}
              onClick={() => (open ? setOpen(false) : openPopover(true))}
            >
              <ChevronDownIcon />
            </button>
          </div>
        </PopoverPrimitive.Anchor>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            ref={contentRef}
            id={contentId}
            data-slot="date-picker-content"
            align="start"
            sideOffset={6}
            collisionPadding={8}
            aria-label={text.calendar}
            className={cn(pickerContentClass, layer, contentClassName)}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              if (focusCalendarRef.current) {
                focusCalendarRef.current = false;
                focusCalendarDay(contentRef.current);
              }
            }}
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              const active = document.activeElement;
              if (!active || active === document.body || contentRef.current?.contains(active)) {
                focusInput();
              }
            }}
            onEscapeKeyDown={(e) => {
              // Oy/yil ko'rinishida Esc — kunlarga qaytadi
              if (view !== 'days') {
                e.preventDefault();
                setView('days');
              }
            }}
            onInteractOutside={(e) => {
              if (containerRef.current?.contains(e.target as Node)) e.preventDefault();
            }}
          >
            <Calendar
              value={value}
              onValueChange={(d) => d && pick(d)}
              month={month}
              onMonthChange={setMonth}
              view={view}
              onViewChange={setView}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={disabledDates}
              numberOfMonths={numberOfMonths}
              today={today}
              labels={labels}
              footer={footer}
            />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {name && (
        <input type="hidden" name={name} value={value ? formatDate(value, 'yyyy-MM-dd') : ''} />
      )}
      <div data-slot="date-picker-error" aria-live="polite" className="-mt-1.5">
        {showError && (
          <p
            id={errorId}
            className="mt-1.5 flex items-center gap-1 text-xs text-danger-soft-foreground"
          >
            <AlertIcon />
            <span>{error === 'invalid' ? text.invalidDate : text.unavailableDate}</span>
          </p>
        )}
      </div>
    </div>
  );
}
