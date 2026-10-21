import { formatDate } from '@akhatmirzo/core';
import { useControllableState, useMediaQuery } from '@akhatmirzo/hooks';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { startOfDay, startOfMonth } from 'date-fns';
import {
  useId,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { MOBILE_QUERY } from '../../lib/media';
import { useFloatingLayer } from '../../lib/modal-layer';
import { mergeRefs } from '../../lib/refs';
import { Button } from '../button';
import { useFieldControl } from '../field/field';
import { Calendar, focusCalendarDay, type CalendarLabels, type CalendarView } from './calendar';
import {
  CalendarIcon,
  ChevronDownIcon,
  pickerActionVariants,
  pickerContainerVariants,
  pickerContentClass,
  presetsRowClass,
  XIcon,
  type DatePickerSize,
} from './date-picker';
import {
  defaultRangePresets,
  isDateSelectable,
  sameDay,
  sameRange,
  type DateConstraints,
  type DateRangePreset,
  type DateRangePresetLabels,
  type DateRangeValue,
} from './date-utils';

export interface DateRangePickerLabels extends CalendarLabels, DateRangePresetLabels {
  placeholder?: string;
  calendar?: string;
  clear?: string;
  presets?: string;
  /** Boshlanish tanlangach, tugash kutilayotganda */
  pickEnd?: string;
  /** Oraliq ajratuvchisi */
  separator?: string;
}

const defaultLabels = {
  placeholder: "Sanalar oralig'ini tanlang",
  calendar: 'Kalendar',
  clear: 'Tozalash',
  presets: 'Tezkor tanlash',
  pickEnd: 'Tugash sanasini tanlang',
  separator: ' – ',
  today: 'Bugun',
  last7Days: 'Oxirgi 7 kun',
  thisMonth: 'Shu oy',
  lastMonth: "O'tgan oy",
};

export interface DateRangePickerProps
  extends
    DateConstraints,
    Omit<ComponentProps<'button'>, 'value' | 'defaultValue' | 'onChange' | 'type'> {
  value?: DateRangeValue | null;
  defaultValue?: DateRangeValue | null;
  /** Faqat to'liq oraliq (`from` va `to`) yoki `null` (tozalanganda) bilan chaqiriladi */
  onValueChange?: (value: DateRangeValue | null) => void;
  format?: string;
  /** Tayyor variantlar: `true` — "Bugun", "Oxirgi 7 kun", "Shu oy", "O'tgan oy" */
  presets?: boolean | DateRangePreset[];
  /** Default — 2, telefonda 1 */
  numberOfMonths?: 1 | 2;
  size?: DatePickerSize;
  invalid?: boolean;
  clearable?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  today?: Date;
  /** Forma uchun: `${name}From`, `${name}To` yashirin maydonlari (yyyy-MM-dd) */
  name?: string;
  labels?: DateRangePickerLabels;
  /** Trigger klassi (`className` — ildizga) */
  triggerClassName?: string;
  contentClassName?: string;
}

/**
 * Sanalar oralig'ini tanlash: ikki oylik kalendar (telefonda bitta), hover'da oraliq oldindan
 * ko'rinadi, tayyor variantlar. Oraliq ikkinchi kun bosilganda tasdiqlanadi.
 * Trigger — tugma: qo'lda yozish (`__.__.____` niqobi) faqat `DatePicker`'da.
 */
export function DateRangePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  minDate,
  maxDate,
  disabledDates,
  format = 'dd.MM.yyyy',
  presets,
  numberOfMonths,
  size = 'md',
  invalid: invalidProp,
  clearable = false,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  today: todayProp,
  name,
  labels,
  className,
  triggerClassName,
  contentClassName,
  id,
  disabled: disabledProp,
  onKeyDown,
  ref,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: DateRangePickerProps) {
  const field = useFieldControl({
    id,
    invalid: invalidProp,
    disabled: disabledProp,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  });
  const { disabled, invalid } = field;
  const text = { ...defaultLabels, ...labels };
  const constraints: DateConstraints = { minDate, maxDate, disabledDates };
  const today = startOfDay(todayProp ?? new Date());
  const layer = useFloatingLayer();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const months = numberOfMonths ?? (isMobile ? 1 : 2);

  const [value, setValue] = useControllableState<DateRangeValue | null>({
    value: valueProp,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  });
  const [open, setOpenState] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  // Ochiq paytdagi qoralama: oraliq tugallanguncha qiymat o'zgarmaydi
  const [draft, setDraft] = useState<DateRangeValue | null>(value);
  const [month, setMonth] = useState(() => startOfMonth(value?.from ?? today));
  const [view, setView] = useState<CalendarView>('days');
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const focusCalendarRef = useRef(false);
  const contentId = useId();
  const valueId = useId();

  const setOpen = (next: boolean, focusCalendar = false) => {
    if (next && disabled) return;
    if (next) {
      setDraft(value);
      setMonth(startOfMonth(value?.from ?? today));
      focusCalendarRef.current = focusCalendar;
    }
    setView('days');
    setOpenState(next);
  };

  const commit = (range: DateRangeValue | null) => {
    setValue(range);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleCalendarChange = (range: DateRangeValue) => {
    setDraft(range);
    if (range.from && range.to) commit(range);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || disabled) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (open) focusCalendarDay(contentRef.current);
      else setOpen(true, true);
    }
  };

  const presetList: DateRangePreset[] =
    presets === true ? defaultRangePresets(text) : Array.isArray(presets) ? presets : [];

  const resolvePreset = (preset: DateRangePreset): DateRangeValue | null => {
    const r = typeof preset.range === 'function' ? preset.range(today) : preset.range;
    if (!r.from || !r.to) return null;
    // min/max chegarasiga qisqartiriladi ("Shu oy" — bugungacha)
    let from = startOfDay(r.from);
    let to = startOfDay(r.to);
    if (minDate && from < startOfDay(minDate)) from = startOfDay(minDate);
    if (maxDate && to > startOfDay(maxDate)) to = startOfDay(maxDate);
    if (from > to) return null;
    const ok = isDateSelectable(from, constraints) && isDateSelectable(to, constraints);
    return ok ? { from, to } : null;
  };

  const picking = Boolean(draft?.from && !draft.to);

  const footer: ReactNode =
    presetList.length > 0 || picking ? (
      <div data-slot="calendar-footer" className={presetsRowClass}>
        {presetList.length > 0 && (
          <div role="group" aria-label={text.presets} className="flex flex-wrap gap-1.5">
            {presetList.map((preset) => {
              const range = resolvePreset(preset);
              const active = sameRange(value, range);
              return (
                <Button
                  key={preset.label}
                  size="sm"
                  variant={active ? 'primary' : 'soft'}
                  aria-pressed={active}
                  disabled={!range}
                  onClick={() => range && commit(range)}
                >
                  {preset.label}
                </Button>
              );
            })}
          </div>
        )}
        <span aria-live="polite" className="ml-auto text-xs text-text-muted">
          {picking && draft?.from
            ? `${formatDate(draft.from, format)}${text.separator}… · ${text.pickEnd}`
            : ''}
        </span>
      </div>
    ) : null;

  const hasValue = Boolean(value?.from && value.to);
  const display = hasValue
    ? sameDay(value?.from, value?.to)
      ? formatDate(value?.from, format)
      : `${formatDate(value?.from, format)}${text.separator}${formatDate(value?.to, format)}`
    : '';
  const canClear = clearable && hasValue && !disabled;

  return (
    <div
      data-slot="date-range-picker"
      className={cn('flex w-full flex-col bg-transparent font-sans text-text', className)}
    >
      <PopoverPrimitive.Root open={open} onOpenChange={(next) => setOpen(next)}>
        <PopoverPrimitive.Anchor asChild>
          <div
            data-slot="date-range-picker-control"
            data-size={size}
            data-state={open ? 'open' : 'closed'}
            data-invalid={invalid ? '' : undefined}
            data-disabled={disabled ? '' : undefined}
            className={cn(pickerContainerVariants({ size }), triggerClassName)}
          >
            <PopoverPrimitive.Trigger asChild>
              <button
                ref={mergeRefs(triggerRef, ref)}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={open ? contentId : undefined}
                disabled={disabled}
                onKeyDown={handleKeyDown}
                onClick={(e) => {
                  e.preventDefault();
                  if (open) setOpen(false);
                  else setOpen(true, e.detail === 0);
                }}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 self-stretch border-0 bg-transparent p-0 text-left font-sans text-text outline-none disabled:cursor-not-allowed"
                {...field.controlProps}
                aria-describedby={
                  [field.controlProps['aria-describedby'], valueId].filter(Boolean).join(' ') ||
                  undefined
                }
                {...props}
              >
                <span aria-hidden="true" className="flex shrink-0 text-text-muted">
                  <CalendarIcon />
                </span>
                <span
                  id={valueId}
                  className={cn('truncate tabular-nums', !hasValue && 'text-text-faint')}
                >
                  {hasValue ? display : text.placeholder}
                </span>
              </button>
            </PopoverPrimitive.Trigger>
            {canClear && (
              <button
                type="button"
                tabIndex={-1}
                aria-label={text.clear}
                className={pickerActionVariants({ size })}
                onClick={() => {
                  setValue(null);
                  triggerRef.current?.focus();
                }}
              >
                <XIcon />
              </button>
            )}
            <span aria-hidden="true" className="-mr-0.5 flex shrink-0 text-text-muted">
              <ChevronDownIcon />
            </span>
          </div>
        </PopoverPrimitive.Anchor>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            ref={contentRef}
            id={contentId}
            data-slot="date-range-picker-content"
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
            onEscapeKeyDown={(e) => {
              if (view !== 'days') {
                e.preventDefault();
                setView('days');
              }
            }}
          >
            <Calendar
              mode="range"
              value={draft}
              onValueChange={handleCalendarChange}
              month={month}
              onMonthChange={setMonth}
              view={view}
              onViewChange={setView}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={disabledDates}
              numberOfMonths={months}
              today={today}
              labels={labels}
              footer={footer}
            />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
      {name && (
        <>
          <input
            type="hidden"
            name={`${name}From`}
            value={value?.from ? formatDate(value.from, 'yyyy-MM-dd') : ''}
          />
          <input
            type="hidden"
            name={`${name}To`}
            value={value?.to ? formatDate(value.to, 'yyyy-MM-dd') : ''}
          />
        </>
      )}
    </div>
  );
}
