import { fuzzyMatch, splitByRanges, type TextRange } from '@akhatmirzo/core';
import {
  useControllableState,
  useDebouncedCallback,
  useHotkeys,
  useLocalStorage,
} from '@akhatmirzo/hooks';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Command } from 'cmdk';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { cn } from '../../lib/cn';
import { listItem } from '../../lib/overlay-styles';
import { ModalOverlay, useReturnFocus } from '../dialog/modal-parts';
import { Kbd } from '../kbd/kbd';
import { Spinner } from '../spinner/spinner';

export interface CommandPaletteItem {
  /** Barqaror kalit ("Oxirgi ishlatilganlar" uchun); default — `label` */
  id?: string;
  label: string;
  /** Ikkinchi qator (muted) */
  description?: string;
  icon?: ReactNode;
  /** Klaviatura yorlig'i, masalan `['mod', 'N']` (`mod` — ⌘ yoki Ctrl) */
  shortcut?: string[];
  /** Qo'shimcha qidiruv so'zlari (sinonimlar) */
  keywords?: string[];
  disabled?: boolean;
  onSelect?: () => void;
  /** Ichki sahifa: tanlanganda yangi ro'yxat ochiladi */
  page?: CommandPalettePage;
  /** `true` — tanlangandan keyin oyna yopilmaydi */
  keepOpen?: boolean;
}

export interface CommandPaletteGroup {
  heading: string;
  items: CommandPaletteItem[];
  /** Faqat qidiruvda ko'rinadi (bo'sh qidiruvda yashirin) */
  searchOnly?: boolean;
}

export interface CommandPalettePage {
  /** Qidiruv maydoni yonidagi "orqaga" tugmasida ko'rinadi */
  title: string;
  placeholder?: string;
  groups: CommandPaletteGroup[];
}

export interface CommandPaletteSearchContext {
  /** Yangi so'rov boshlanganda yoki oyna yopilganda bekor qilinadi */
  signal: AbortSignal;
}

export interface CommandPaletteLabels {
  /** Dialog sarlavhasi (ekran o'quvchi uchun) */
  title?: string;
  /** Qidiruv maydonining aria-label'i */
  search?: string;
  /** Ro'yxatning aria-label'i */
  list?: string;
  recent?: string;
  /** Server natijalari guruhi */
  results?: string;
  loading?: string;
  empty?: string;
  emptyDescription?: (query: string) => ReactNode;
  back?: string;
  navigate?: string;
  select?: string;
  close?: string;
}

const defaultLabels: Required<CommandPaletteLabels> = {
  title: 'Buyruqlar',
  search: 'Buyruq qidirish',
  list: 'Buyruqlar',
  recent: 'Oxirgi ishlatilganlar',
  results: 'Natijalar',
  loading: 'Qidirilmoqda...',
  empty: 'Hech narsa topilmadi',
  emptyDescription: (query) => `"${query}" bo'yicha natija yo'q`,
  back: 'Orqaga',
  navigate: 'yurish',
  select: 'tanlash',
  close: 'yopish',
};

export interface CommandPaletteProps extends Omit<
  ComponentProps<'div'>,
  'children' | 'onSelect' | 'defaultValue' | 'dir'
> {
  groups: CommandPaletteGroup[];
  /** Ochish/yopish yorlig'i; `false` — o'chiq */
  hotkey?: string | false;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  /** Server qidiruvi (300ms debounce); natijalar alohida guruhda */
  onSearch?: (
    query: string,
    context: CommandPaletteSearchContext,
  ) => Promise<CommandPaletteItem[]> | CommandPaletteItem[];
  /** "Oxirgi ishlatilganlar" guruhi (localStorage) */
  recent?: boolean;
  /** localStorage kaliti */
  recentKey?: string;
  recentLimit?: number;
  labels?: CommandPaletteLabels;
  /** Ochuvchi element (Radix `Trigger asChild`) */
  children?: ReactElement;
  /** Portal konteyneri (default — `document.body`) */
  container?: HTMLElement | null;
  overlayClassName?: string;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
}

const itemId = (item: CommandPaletteItem) => item.id ?? item.label;

/** Barcha darajadagi (ichki sahifalar bilan) bajariladigan elementlar */
function collectItems(groups: CommandPaletteGroup[], out = new Map<string, CommandPaletteItem>()) {
  for (const group of groups) {
    for (const item of group.items) {
      if (item.page) collectItems(item.page.groups, out);
      else if (!out.has(itemId(item))) out.set(itemId(item), item);
    }
  }
  return out;
}

interface Entry {
  value: string;
  item: CommandPaletteItem;
  ranges: TextRange[];
  /** Server natijasi — "Oxirgi ishlatilganlar"ga yozilmaydi */
  server?: boolean;
}

interface VisibleGroup {
  key: string;
  heading: string;
  entries: Entry[];
}

/** Fuzzy ball: label asosiy, kalit so'zlar biroz pastroq; mos kelmasa — `null` */
function scoreItem(item: CommandPaletteItem, query: string) {
  const label = fuzzyMatch(item.label, query);
  let score = label ? label.score : -Infinity;
  for (const keyword of item.keywords ?? []) {
    const m = fuzzyMatch(keyword, query);
    if (m && m.score - 2 > score) score = m.score - 2;
  }
  return score === -Infinity ? null : { score, ranges: label?.ranges ?? [] };
}

function searchGroups(groups: CommandPaletteGroup[], query: string, prefix: string) {
  const out: VisibleGroup[] = [];
  groups.forEach((group, gi) => {
    if (!query && group.searchOnly) return;
    const entries: Array<Entry & { score: number }> = [];
    group.items.forEach((item, ii) => {
      const value = `${prefix}${gi}:${ii}:${itemId(item)}`;
      if (!query) {
        entries.push({ value, item, ranges: [], score: 0 });
        return;
      }
      const hit = scoreItem(item, query);
      if (hit) entries.push({ value, item, ...hit });
    });
    if (query) entries.sort((a, b) => b.score - a.score);
    if (entries.length > 0) out.push({ key: `${prefix}${gi}`, heading: group.heading, entries });
  });
  return out;
}

const itemClass = cn(
  listItem.replace(/\bdata-disabled:\S+/g, ''),
  'group h-11 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:size-[18px]',
);

const headingClass =
  '[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-muted';

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function SearchOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      aria-hidden="true"
      className="size-8 text-text-faint"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5M3 3l18 18" />
    </svg>
  );
}

function ChevronIcon({ dir }: { dir: 'left' | 'right' }) {
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
      <path d={dir === 'left' ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'} />
    </svg>
  );
}

/** Fuzzy mos kelgan harflar qalin */
function Highlight({ text, ranges }: { text: string; ranges: TextRange[] }) {
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

interface BodyProps {
  groups: CommandPaletteGroup[];
  placeholder: string;
  onSearch: CommandPaletteProps['onSearch'];
  recent: boolean;
  recentKey: string;
  recentLimit: number;
  text: Required<CommandPaletteLabels>;
  inputRef: RefObject<HTMLInputElement | null>;
  close: () => void;
}

/** Oyna ichi: har ochilganda yangidan yaratiladi (qidiruv va sahifalar tozalanadi) */
function PaletteBody({
  groups,
  placeholder,
  onSearch,
  recent,
  recentKey,
  recentLimit,
  text,
  inputRef,
  close,
}: BodyProps) {
  const [query, setQuery] = useState('');
  const [pages, setPages] = useState<CommandPalettePage[]>([]);
  const [server, setServer] = useState<{ query: string; items: CommandPaletteItem[] } | null>(null);
  const [searching, setSearching] = useState(false);
  const [recentIds, setRecentIds] = useLocalStorage<string[]>(recentKey, []);
  const abortRef = useRef<AbortController | null>(null);

  const page = pages.at(-1);
  const trimmed = query.trim();
  const serverEnabled = !!onSearch && !page;

  const runSearch = useDebouncedCallback((q: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    Promise.resolve()
      .then(() => onSearch?.(q, { signal: controller.signal }) ?? [])
      .catch(() => [] as CommandPaletteItem[])
      .then((items) => {
        if (controller.signal.aborted) return;
        setServer({ query: q, items });
        setSearching(false);
      });
  }, 300);

  useEffect(() => () => abortRef.current?.abort(), []);

  const stopSearch = () => {
    runSearch.cancel();
    abortRef.current?.abort();
    setServer(null);
    setSearching(false);
  };

  const changeQuery = (q: string) => {
    setQuery(q);
    if (!serverEnabled) return;
    if (q.trim()) {
      setSearching(true);
      runSearch(q.trim());
    } else {
      stopSearch();
    }
  };

  const openPage = (next: CommandPalettePage) => {
    stopSearch();
    setQuery('');
    setPages((p) => [...p, next]);
    inputRef.current?.focus();
  };

  const back = () => {
    setQuery('');
    setPages((p) => p.slice(0, -1));
    inputRef.current?.focus();
  };

  const select = (item: CommandPaletteItem, remember = true) => {
    if (item.page) {
      openPage(item.page);
      return;
    }
    if (recent && remember) {
      const id = itemId(item);
      setRecentIds((ids) => [id, ...ids.filter((x) => x !== id)].slice(0, recentLimit));
    }
    if (!item.keepOpen) close();
    item.onSelect?.();
  };

  const allItems = useMemo(() => collectItems(groups), [groups]);

  const visible = useMemo(() => {
    const out: VisibleGroup[] = [];
    if (!page && !trimmed && recent) {
      const entries = recentIds
        .map((id) => allItems.get(id))
        .filter((item): item is CommandPaletteItem => !!item)
        .slice(0, recentLimit)
        .map((item) => ({ value: `r:${itemId(item)}`, item, ranges: [] }));
      if (entries.length > 0) out.push({ key: 'recent', heading: text.recent, entries });
    }
    out.push(...searchGroups(page ? page.groups : groups, trimmed, `p${pages.length}:`));
    if (serverEnabled && trimmed && server?.query === trimmed && server.items.length > 0) {
      out.push({
        key: 'server',
        heading: text.results,
        entries: server.items.map((item, i) => ({
          value: `s:${i}:${itemId(item)}`,
          item,
          ranges: fuzzyMatch(item.label, trimmed)?.ranges ?? [],
          server: true,
        })),
      });
    }
    return out;
  }, [
    page,
    pages.length,
    trimmed,
    recent,
    recentIds,
    allItems,
    recentLimit,
    text.recent,
    text.results,
    groups,
    serverEnabled,
    server,
  ]);

  const loading = serverEnabled && !!trimmed && (searching || server?.query !== trimmed);
  const empty = visible.length === 0 && !loading;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && query === '' && pages.length > 0) {
      e.preventDefault();
      back();
    }
  };

  return (
    <Command
      shouldFilter={false}
      loop
      vimBindings={false}
      label={text.search}
      className="flex min-h-0 flex-1 flex-col outline-none"
    >
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4 text-text-muted">
        {page ? (
          <button
            type="button"
            onClick={back}
            aria-label={`${text.back}: ${page.title}`}
            className="inline-flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-md border-0 bg-surface-muted py-0 pr-2 pl-1 font-sans text-xs font-medium text-text transition-colors duration-fast hover:bg-primary-soft hover:text-primary-soft-foreground focus-ring [&_svg]:size-4"
          >
            <ChevronIcon dir="left" />
            {page.title}
          </button>
        ) : (
          <SearchIcon className="size-[18px] shrink-0" />
        )}
        <Command.Input
          ref={inputRef}
          value={query}
          onValueChange={changeQuery}
          onKeyDown={handleKeyDown}
          placeholder={page?.placeholder ?? placeholder}
          aria-label={text.search}
          className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 font-sans text-base text-text outline-none placeholder:text-text-faint"
        />
        <Kbd aria-hidden="true" className="max-sm:hidden">
          Esc
        </Kbd>
      </div>

      <Command.List
        label={text.list}
        className="max-h-85 min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5"
      >
        {visible.map((group) => (
          <Command.Group key={group.key} heading={group.heading} className={headingClass}>
            {group.entries.map(({ value, item, ranges, server: fromServer }) => (
              <Command.Item
                key={value}
                value={value}
                disabled={item.disabled}
                onSelect={() => select(item, !fromServer)}
                className={cn(itemClass, item.description && 'h-auto min-h-11 py-1.5')}
              >
                {item.icon && (
                  <span
                    aria-hidden="true"
                    className="flex shrink-0 text-text-muted group-data-[selected=true]:text-current"
                  >
                    {item.icon}
                  </span>
                )}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span data-slot="command-palette-item-label" className="truncate">
                    <Highlight text={item.label} ranges={ranges} />
                  </span>
                  {item.description && (
                    <span className="truncate text-xs text-text-muted">{item.description}</span>
                  )}
                </span>
                {item.shortcut && item.shortcut.length > 0 && (
                  <Kbd keys={item.shortcut} className="ml-auto" />
                )}
                {item.page && (
                  <span
                    aria-hidden="true"
                    className="ml-auto flex shrink-0 text-text-faint group-data-[selected=true]:text-current"
                  >
                    <ChevronIcon dir="right" />
                  </span>
                )}
              </Command.Item>
            ))}
          </Command.Group>
        ))}

        {loading && (
          <div data-slot="command-palette-loading">
            {visible.every((g) => g.key !== 'server') && (
              <div className="px-2.5 pt-2.5 pb-1 text-xs font-medium text-text-muted">
                {text.results}
              </div>
            )}
            <div className="flex h-11 items-center gap-2.5 px-2.5 text-sm text-text-muted">
              <Spinner size="sm" label={text.loading} />
              <span aria-hidden="true">{text.loading}</span>
            </div>
          </div>
        )}

        {empty && (
          <div
            data-slot="command-palette-empty"
            className="flex flex-col items-center gap-1.5 px-4 py-8 text-center"
          >
            <SearchOffIcon />
            <p className="m-0 text-base font-semibold text-text">{text.empty}</p>
            {trimmed && (
              <p className="m-0 text-sm text-text-muted">{text.emptyDescription(trimmed)}</p>
            )}
          </div>
        )}
      </Command.List>

      <div
        data-slot="command-palette-footer"
        className="flex shrink-0 items-center gap-3.5 border-t border-border bg-surface-muted px-4 py-2.5 text-xs text-text-muted max-sm:hidden"
      >
        <span className="inline-flex items-center gap-1.5">
          <Kbd>↑↓</Kbd>
          {text.navigate}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Kbd>↵</Kbd>
          {text.select}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Kbd>Esc</Kbd>
          {text.close}
        </span>
      </div>
    </Command>
  );
}

/**
 * Global qidiruv va buyruqlar oynasi (`Ctrl+K` / `⌘K`). Fuzzy qidiruv o'zbekcha normallashtirish
 * bilan; bo'sh qidiruvda "Oxirgi ishlatilganlar"; ichki sahifalar (`Backspace` — orqaga).
 */
export function CommandPalette({
  groups,
  hotkey = 'mod+k',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placeholder = 'Qidirish yoki buyruq yozish...',
  onSearch,
  recent = true,
  recentKey = 'ak:command-palette:recent',
  recentLimit = 3,
  labels,
  children,
  container,
  overlayClassName,
  className,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: CommandPaletteProps) {
  const text = { ...defaultLabels, ...labels };
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const returnFocus = useReturnFocus();

  useHotkeys(hotkey || '', () => setOpen(!open), {
    enabled: !!hotkey,
    enableOnInputs: true,
  });

  return (
    <RadixDialog.Root open={open} onOpenChange={setOpen}>
      {children && <RadixDialog.Trigger asChild>{children}</RadixDialog.Trigger>}
      <RadixDialog.Portal container={container}>
        <ModalOverlay className={overlayClassName} />
        <RadixDialog.Content
          data-slot="command-palette"
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            returnFocus.save();
            onOpenAutoFocus?.(event);
            if (event.defaultPrevented) return;
            event.preventDefault();
            inputRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            onCloseAutoFocus?.(event);
            returnFocus.restore(event);
          }}
          className={cn(
            'fixed top-[18vh] left-1/2 z-(--ak-z-modal) flex max-h-[calc(82dvh-16px)] w-[calc(100vw-32px)] max-w-140 -translate-x-1/2 flex-col overflow-hidden',
            'rounded-2xl border-0 bg-surface font-sans text-text shadow-xl outline-none',
            'data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out',
            'motion-reduce:data-[state=open]:animate-overlay-in motion-reduce:data-[state=closed]:animate-overlay-out',
            className,
          )}
          {...props}
        >
          <RadixDialog.Title className="sr-only">{text.title}</RadixDialog.Title>
          <PaletteBody
            groups={groups}
            placeholder={placeholder}
            onSearch={onSearch}
            recent={recent}
            recentKey={recentKey}
            recentLimit={recentLimit}
            text={text}
            inputRef={inputRef}
            close={() => setOpen(false)}
          />
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
