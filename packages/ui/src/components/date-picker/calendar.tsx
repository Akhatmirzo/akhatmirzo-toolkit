import {
  MONTHS_UZ,
  MONTHS_UZ_SHORT,
  WEEKDAYS_UZ,
  WEEKDAYS_UZ_SHORT,
  weekdayIndex,
} from '@akhatmirzo/core';
import { useControllableState } from '@akhatmirzo/hooks';
import { addMonths, isSameDay, isWithinInterval, startOfMonth } from 'date-fns';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  DayPicker,
  type ChevronProps,
  type DayButtonProps,
  type DayProps,
  type Matcher,
  type MonthCaptionProps,
} from 'react-day-picker';
import { uz } from 'react-day-picker/locale/uz';
import { cn } from '../../lib/cn';
import { mergeRefs } from '../../lib/refs';
import {
  isMonthOutOfRange,
  nextRange,
  type DateConstraints,
  type DateRangeValue,
} from './date-utils';

export type CalendarView = 'days' | 'months' | 'years';

export interface CalendarLabels {
  previousMonth?: string;
  nextMonth?: string;
  previousYear?: string;
  nextYear?: string;
  previousYears?: string;
  nextYears?: string;
  /** Sarlavha tugmasi: oy/yil tanlash ko'rinishini ochadi */
  chooseMonth?: string;
  chooseYear?: string;
  monthsGrid?: string;
  yearsGrid?: string;
  navigation?: string;
  today?: string;
  selected?: string;
  /** Oylar — Yanvar … Dekabr */
  months?: readonly string[];
  monthsShort?: readonly string[];
  /** Hafta kunlari — dushanbadan */
  weekdays?: readonly string[];
  weekdaysShort?: readonly string[];
}

const defaultLabels: Required<CalendarLabels> = {
  previousMonth: 'Oldingi oy',
  nextMonth: 'Keyingi oy',
  previousYear: 'Oldingi yil',
  nextYear: 'Keyingi yil',
  previousYears: 'Oldingi yillar',
  nextYears: 'Keyingi yillar',
  chooseMonth: 'Oy va yilni tanlash',
  chooseYear: 'Yilni tanlash',
  monthsGrid: 'Oylar',
  yearsGrid: 'Yillar',
  navigation: 'Oylar bo‘yicha yurish',
  today: 'Bugun',
  selected: 'tanlangan',
  months: MONTHS_UZ,
  monthsShort: MONTHS_UZ_SHORT,
  weekdays: WEEKDAYS_UZ,
  weekdaysShort: WEEKDAYS_UZ_SHORT,
};

interface CalendarBaseProps
  extends DateConstraints, Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange' | 'dir'> {
  /** Ko'rsatiladigan oylar soni */
  numberOfMonths?: number;
  /** Ko'rsatilayotgan (birinchi) oy — boshqariladigan */
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** Ko'rinish: kunlar / oylar / yillar — boshqariladigan */
  view?: CalendarView;
  defaultView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  /** Bugungi sana (default — `new Date()`) */
  today?: Date;
  /** Qo'shni oylar kunlari; default — bitta oyda `true`, bir nechtasida `false` */
  showOutsideDays?: boolean;
  /** Ochilganda tanlangan (yoki bugungi) kunga fokus */
  autoFocus?: boolean;
  /** Kalendar ostidagi kontent (masalan tayyor variantlar) */
  footer?: ReactNode;
  labels?: CalendarLabels;
}

export interface CalendarSingleProps extends CalendarBaseProps {
  mode?: 'single';
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
}

export interface CalendarRangeProps extends CalendarBaseProps {
  mode: 'range';
  value?: DateRangeValue | null;
  defaultValue?: DateRangeValue | null;
  onValueChange?: (value: DateRangeValue) => void;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

type CalendarValue = Date | DateRangeValue | null;

/* ---------- Ichki kontekst (DayPicker custom komponentlari uchun) ---------- */

interface PreviewRange {
  start: Date;
  end: Date;
  /** Kursor turgan uch (from emas) */
  pointer: Date;
}

interface CalendarContextValue {
  text: Required<CalendarLabels>;
  preview: PreviewRange | null;
  openMonths: (displayIndex: number, month: Date) => void;
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

function useCalendarContext() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error('Calendar qismlari Calendar ichida ishlatilishi kerak');
  return ctx;
}

/* ---------- Stillar ---------- */

const navButton = [
  'inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-0 text-text-subtle',
  'transition-colors duration-fast ease-out hover:bg-surface-muted hover:text-text focus-ring',
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-transparent',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent [&_svg]:size-4',
].join(' ');

const titleButton = [
  'inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border-0 bg-transparent px-2.5 font-sans text-sm font-semibold text-text',
  'transition-colors duration-fast ease-out hover:bg-surface-muted focus-ring',
  '[&_svg]:size-3.5 [&_svg]:text-text-muted',
].join(' ');

const todayDot =
  "after:pointer-events-none after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-primary after:content-['']";

const cellButton = [
  'relative flex h-9 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 font-sans text-sm text-text',
  'transition-colors duration-fast ease-out hover:bg-surface-muted focus-ring',
  'aria-[current=true]:bg-primary aria-[current=true]:font-semibold aria-[current=true]:text-primary-foreground aria-[current=true]:hover:bg-primary-hover',
  'aria-disabled:cursor-not-allowed aria-disabled:text-text-faint aria-disabled:hover:bg-transparent',
].join(' ');

/* ---------- Ikonkalar ---------- */

function ChevronIcon({ orientation = 'left' }: { orientation?: ChevronProps['orientation'] }) {
  const d = {
    left: 'm15 18-6-6 6-6',
    right: 'm9 18 6-6-6-6',
    up: 'm18 15-6-6-6 6',
    down: 'm6 9 6 6 6-6',
  }[orientation];
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
      <path d={d} />
    </svg>
  );
}

function CalendarChevron({ orientation }: ChevronProps) {
  return <ChevronIcon orientation={orientation} />;
}

/* ---------- DayPicker custom komponentlari ---------- */

function CalendarMonthCaption({
  calendarMonth,
  displayIndex,
  children,
  ...props
}: MonthCaptionProps) {
  const { text, openMonths } = useCalendarContext();
  const date = calendarMonth.date;
  const caption = `${text.months[date.getMonth()]} ${date.getFullYear()}`;
  return (
    <div {...props} data-slot="calendar-caption">
      <button
        type="button"
        className={titleButton}
        aria-label={`${caption}. ${text.chooseMonth}`}
        onClick={() => openMonths(displayIndex, date)}
      >
        {caption}
        <ChevronIcon orientation="down" />
      </button>
      {/* DayPicker'ning CaptionLabel'i (role="status") — oy almashganini o'qib beradi */}
      <span className="sr-only">{children}</span>
    </div>
  );
}

function CalendarDay({ day, modifiers, className: _className, children, ...props }: DayProps) {
  const { preview } = useCalendarContext();
  const date = day.date;
  const visible = !modifiers.hidden && !day.outside;

  let strip: 'full' | 'start' | 'end' | null = null;
  let previewStrip = false;
  if (visible) {
    if (modifiers.range_middle) strip = 'full';
    else if (modifiers.range_start && !modifiers.range_end) strip = 'start';
    else if (modifiers.range_end && !modifiers.range_start) strip = 'end';
    else if (preview && !isSameDay(preview.start, preview.end)) {
      if (isSameDay(date, preview.start)) strip = 'start';
      else if (isSameDay(date, preview.end)) strip = 'end';
      else if (isWithinInterval(date, { start: preview.start, end: preview.end })) strip = 'full';
      previewStrip = strip !== null;
    }
  }

  return (
    <td
      {...(props as ComponentProps<'td'>)}
      data-range-start={visible && modifiers.range_start ? '' : undefined}
      data-range-end={visible && modifiers.range_end ? '' : undefined}
      data-range-middle={visible && modifiers.range_middle ? '' : undefined}
      data-preview={previewStrip ? '' : undefined}
      className="relative p-0.5 text-center align-middle"
    >
      {strip && (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-y-0.5 bg-primary-soft',
            strip === 'full' && 'inset-x-0',
            strip === 'start' && 'right-0 left-1/2',
            strip === 'end' && 'right-1/2 left-0',
            previewStrip && 'opacity-60',
          )}
        />
      )}
      {children}
    </td>
  );
}

function CalendarDayButton({ day, modifiers, className: _className, ...props }: DayButtonProps) {
  const { preview } = useCalendarContext();
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const filled = Boolean(modifiers.selected && !modifiers.range_middle);
  const pointer = preview && isSameDay(preview.pointer, day.date);
  return (
    <button
      ref={ref}
      {...props}
      data-slot="calendar-day"
      className={cn(
        'relative inline-flex size-9 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0',
        'font-sans text-[13px] leading-none text-text tabular-nums',
        'transition-colors duration-fast ease-out hover:bg-surface-muted focus-ring',
        day.outside && 'text-text-faint',
        modifiers.today && todayDot,
        modifiers.range_middle && 'text-primary-soft-foreground hover:bg-primary-soft-hover',
        pointer && !filled && 'ring-1 ring-primary ring-inset',
        modifiers.disabled &&
          'cursor-not-allowed text-text-faint line-through decoration-border-strong hover:bg-transparent',
        filled &&
          'bg-primary font-semibold text-primary-foreground after:bg-primary-foreground hover:bg-primary-hover',
      )}
    />
  );
}

const dayPickerComponents = {
  Chevron: CalendarChevron,
  MonthCaption: CalendarMonthCaption,
  Day: CalendarDay,
  DayButton: CalendarDayButton,
};

const dayPickerClassNames = {
  root: 'relative',
  months: 'relative flex flex-col gap-4 sm:flex-row sm:gap-6',
  month: 'relative flex flex-col gap-2',
  month_caption: 'flex h-9 items-center justify-center',
  button_previous: cn(navButton, 'absolute top-0.5 left-0'),
  button_next: cn(navButton, 'absolute top-0.5 right-0'),
  chevron: '',
  month_grid: 'border-collapse',
  weekdays: '',
  weekday: 'h-7 w-10 p-0 text-center align-middle text-xs font-medium text-text-muted',
  weeks: '',
  week: '',
  day: '',
  day_button: '',
};

/* ---------- Oy / yil tanlash ko'rinishlari ---------- */

interface PickerGridProps {
  label: string;
  items: {
    key: number;
    label: string;
    ariaLabel: string;
    current: boolean;
    disabled: boolean;
    today: boolean;
  }[];
  autoFocus: boolean;
  onPick: (key: number) => void;
}

/** 3 ustunli tugmalar to'ri: strelkalar bilan yurish, Enter/Space — tanlash */
function PickerGrid({ label, items, autoFocus, onPick }: PickerGridProps) {
  const initial = Math.max(
    0,
    items.findIndex((i) => i.current),
  );
  const [active, setActive] = useState(initial);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) refs.current[initial]?.focus();
    // faqat ko'rinish ochilganda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const move = (index: number) => {
    const next = Math.min(items.length - 1, Math.max(0, index));
    setActive(next);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 }[e.key];
    if (delta !== undefined) {
      e.preventDefault();
      move(active + delta);
    } else if (e.key === 'Home') {
      e.preventDefault();
      move(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      move(items.length - 1);
    }
  };

  return (
    <div role="group" aria-label={label} className="grid grid-cols-3 gap-1.5" onKeyDown={onKeyDown}>
      {items.map((item, i) => (
        <button
          key={item.key}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          tabIndex={i === active ? 0 : -1}
          aria-label={item.ariaLabel}
          aria-current={item.current || undefined}
          aria-disabled={item.disabled || undefined}
          className={cn(cellButton, item.today && todayDot)}
          onFocus={() => setActive(i)}
          onClick={() => {
            if (!item.disabled) onPick(item.key);
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

interface ViewHeaderProps {
  title: ReactNode;
  prevLabel: string;
  nextLabel: string;
  prevDisabled: boolean;
  nextDisabled: boolean;
  onPrev: () => void;
  onNext: () => void;
}

function ViewHeader({
  title,
  prevLabel,
  nextLabel,
  prevDisabled,
  nextDisabled,
  onPrev,
  onNext,
}: ViewHeaderProps) {
  return (
    <div className="mb-2 flex h-9 items-center justify-between">
      <button
        type="button"
        className={navButton}
        aria-label={prevLabel}
        aria-disabled={prevDisabled || undefined}
        onClick={() => !prevDisabled && onPrev()}
      >
        <ChevronIcon orientation="left" />
      </button>
      {title}
      <button
        type="button"
        className={navButton}
        aria-label={nextLabel}
        aria-disabled={nextDisabled || undefined}
        onClick={() => !nextDisabled && onNext()}
      >
        <ChevronIcon orientation="right" />
      </button>
    </div>
  );
}

const yearOutOfRange = (year: number, { minDate, maxDate }: DateConstraints) =>
  (minDate != null && year < minDate.getFullYear()) ||
  (maxDate != null && year > maxDate.getFullYear());

/* ---------- Calendar ---------- */

/**
 * Kalendar (react-day-picker ustida, o'z stillarimiz bilan). Hafta dushanbadan, o'zbekcha nomlar.
 * Sarlavha bosilsa — oy/yil tanlash. Klaviatura: ← → kun, ↑ ↓ hafta, PageUp/PageDown oy
 * (Shift — yil), Home/End — hafta boshi/oxiri, Enter/Space — tanlash.
 */
export function Calendar(props: CalendarProps) {
  const {
    mode = 'single',
    value: valueProp,
    defaultValue,
    onValueChange,
    minDate,
    maxDate,
    disabledDates,
    numberOfMonths = 1,
    month: monthProp,
    defaultMonth,
    onMonthChange,
    view: viewProp,
    defaultView = 'days',
    onViewChange,
    today: todayProp,
    showOutsideDays = numberOfMonths === 1,
    autoFocus = false,
    footer,
    labels,
    className,
    onKeyDown,
    ref,
    ...rest
  } = props;
  const text = { ...defaultLabels, ...labels };
  const [today] = useState(() => todayProp ?? new Date());
  const now = todayProp ?? today;

  const [selected, setSelected] = useControllableState<CalendarValue>({
    value: valueProp,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange as ((v: CalendarValue) => void) | undefined,
  });
  const single = mode === 'single' ? ((selected as Date | null) ?? null) : null;
  const range = mode === 'range' ? ((selected as DateRangeValue | null) ?? null) : null;

  const [initialMonth] = useState(() => startOfMonth(defaultMonth ?? single ?? range?.from ?? now));
  const [month = initialMonth, setMonth] = useControllableState<Date>({
    value: monthProp,
    defaultValue: initialMonth,
    onChange: onMonthChange,
  });

  const [view = 'days', setView] = useControllableState<CalendarView>({
    value: viewProp,
    defaultValue: defaultView,
    onChange: onViewChange,
  });
  // Oy/yil ko'rinishi: qaysi oy ustuni bosilgan va qaysi yil ko'rilmoqda
  const [viewIndex, setViewIndex] = useState(0);
  const [browseYear, setBrowseYear] = useState(() => month.getFullYear());
  const [yearPageStart, setYearPageStart] = useState(() => browseYear - (browseYear % 12));
  const [focusView, setFocusView] = useState(false);
  const [viewSize, setViewSize] = useState<CSSProperties | undefined>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [hovered, setHovered] = useState<Date | null>(null);
  const preview = useMemo<PreviewRange | null>(() => {
    if (!range?.from || range.to || !hovered) return null;
    const from = range.from;
    return hovered < from
      ? { start: hovered, end: from, pointer: hovered }
      : { start: from, end: hovered, pointer: hovered };
  }, [range?.from, range?.to, hovered]);

  const constraints: DateConstraints = { minDate, maxDate, disabledDates };

  const openMonths = (displayIndex: number, date: Date) => {
    const el = wrapperRef.current;
    // Ko'rinishlar almashganda panel o'lchami sakramasin
    if (el && el.offsetWidth > 0) {
      setViewSize({ minWidth: el.offsetWidth, minHeight: el.offsetHeight - footerHeight(el) });
    }
    setViewIndex(displayIndex);
    setBrowseYear(date.getFullYear());
    setFocusView(true);
    setView('months');
  };

  const backToDays = () => {
    setFocusView(true);
    setView('days');
  };

  const disabled: Matcher[] = [];
  if (minDate) disabled.push({ before: minDate });
  if (maxDate) disabled.push({ after: maxDate });
  if (disabledDates) disabled.push(disabledDates);

  const ctx: CalendarContextValue = { text, preview, openMonths };

  const dayPickerShared = {
    locale: uz,
    weekStartsOn: 1 as const,
    numberOfMonths,
    month,
    onMonthChange: setMonth,
    startMonth: minDate ? startOfMonth(minDate) : undefined,
    endMonth: maxDate ? startOfMonth(maxDate) : undefined,
    today: now,
    showOutsideDays,
    disabled,
    navLayout: 'around' as const,
    autoFocus: autoFocus || (focusView && view === 'days'),
    components: dayPickerComponents,
    classNames: dayPickerClassNames,
    formatters: {
      formatCaption: (d: Date) => `${text.months[d.getMonth()]} ${d.getFullYear()}`,
      formatWeekdayName: (d: Date) => text.weekdaysShort[weekdayIndex(d)] ?? '',
    },
    labels: {
      labelNav: () => text.navigation,
      labelPrevious: () => text.previousMonth,
      labelNext: () => text.nextMonth,
      labelGrid: (d: Date) => `${text.months[d.getMonth()]} ${d.getFullYear()}`,
      labelWeekday: (d: Date) => text.weekdays[weekdayIndex(d)] ?? '',
      labelDayButton: (d: Date, m: Record<string, boolean>) => {
        let label = `${d.getDate()} ${text.months[d.getMonth()]} ${d.getFullYear()}, ${text.weekdays[weekdayIndex(d)]}`;
        if (m.today) label = `${text.today}, ${label}`;
        if (m.selected) label = `${label}, ${text.selected}`;
        return label;
      },
    },
    onDayMouseEnter: (d: Date) => setHovered(d),
    onDayMouseLeave: () => setHovered(null),
    onDayFocus: (d: Date) => setHovered(d),
  };

  let content: ReactNode;
  if (view === 'days') {
    content =
      mode === 'range' ? (
        <DayPicker
          {...dayPickerShared}
          mode="range"
          selected={range?.from ? { from: range.from, to: range.to ?? undefined } : undefined}
          onSelect={(_next, day) => setSelected(nextRange(range, day))}
        />
      ) : (
        <DayPicker
          {...dayPickerShared}
          mode="single"
          required
          selected={single ?? undefined}
          onSelect={(_next, day) => setSelected(day)}
        />
      );
  } else if (view === 'months') {
    const shown = addMonths(month, viewIndex);
    content = (
      <div style={viewSize}>
        <ViewHeader
          title={
            <button
              type="button"
              className={titleButton}
              aria-label={`${browseYear}. ${text.chooseYear}`}
              onClick={() => {
                setYearPageStart(browseYear - (browseYear % 12));
                setFocusView(true);
                setView('years');
              }}
            >
              {browseYear}
              <ChevronIcon orientation="down" />
            </button>
          }
          prevLabel={text.previousYear}
          nextLabel={text.nextYear}
          prevDisabled={yearOutOfRange(browseYear - 1, constraints)}
          nextDisabled={yearOutOfRange(browseYear + 1, constraints)}
          onPrev={() => setBrowseYear((y) => y - 1)}
          onNext={() => setBrowseYear((y) => y + 1)}
        />
        <PickerGrid
          key={browseYear}
          label={text.monthsGrid}
          autoFocus={focusView}
          items={text.monthsShort.map((short, m) => ({
            key: m,
            label: short,
            ariaLabel: `${text.months[m]} ${browseYear}`,
            current: shown.getFullYear() === browseYear && shown.getMonth() === m,
            today: now.getFullYear() === browseYear && now.getMonth() === m,
            disabled: isMonthOutOfRange(new Date(browseYear, m, 1), constraints),
          }))}
          onPick={(m) => {
            setMonth(addMonths(new Date(browseYear, m, 1), -viewIndex));
            backToDays();
          }}
        />
      </div>
    );
  } else {
    const years = Array.from({ length: 12 }, (_, i) => yearPageStart + i);
    content = (
      <div style={viewSize}>
        <ViewHeader
          title={
            <span className="px-2.5 text-sm font-semibold text-text tabular-nums">
              {years[0]} – {years[11]}
            </span>
          }
          prevLabel={text.previousYears}
          nextLabel={text.nextYears}
          prevDisabled={yearOutOfRange(yearPageStart - 1, constraints)}
          nextDisabled={yearOutOfRange(yearPageStart + 12, constraints)}
          onPrev={() => setYearPageStart((y) => y - 12)}
          onNext={() => setYearPageStart((y) => y + 12)}
        />
        <PickerGrid
          key={yearPageStart}
          label={text.yearsGrid}
          autoFocus={focusView}
          items={years.map((y) => ({
            key: y,
            label: String(y),
            ariaLabel: String(y),
            current: y === browseYear,
            today: y === now.getFullYear(),
            disabled: yearOutOfRange(y, constraints),
          }))}
          onPick={(y) => {
            setBrowseYear(y);
            setFocusView(true);
            setView('months');
          }}
        />
      </div>
    );
  }

  return (
    <CalendarContext.Provider value={ctx}>
      <div
        ref={mergeRefs(ref, wrapperRef)}
        data-slot="calendar"
        data-mode={mode}
        data-view={view}
        className={cn('w-fit bg-transparent font-sans text-sm text-text', className)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented) return;
          if (e.key === 'Escape' && view !== 'days') {
            e.preventDefault();
            e.stopPropagation();
            backToDays();
          }
        }}
        {...rest}
      >
        {/* Footer kengroq bo'lsa kalendar o'rtada turadi */}
        <div className="flex justify-center">{content}</div>
        {footer}
      </div>
    </CalendarContext.Provider>
  );
}

function footerHeight(el: HTMLElement) {
  const footer = el.querySelector<HTMLElement>('[data-slot="calendar-footer"]');
  return footer ? footer.offsetHeight : 0;
}

/** Kalendar ichidagi fokus nishoni (tanlangan / bugungi kun) ga fokus beradi */
export function focusCalendarDay(container: HTMLElement | null) {
  const day = container?.querySelector<HTMLButtonElement>(
    '[data-slot="calendar-day"][tabindex="0"]',
  );
  day?.focus();
  return Boolean(day);
}
