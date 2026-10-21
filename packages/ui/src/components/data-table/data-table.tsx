import { useControllableState, useDebouncedCallback, useMediaQuery } from '@akhatmirzo/hooks';
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type FilterFn,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { MOBILE_QUERY } from '../../lib/media';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { DropdownMenu } from '../dropdown-menu';
import { Input } from '../input';
import { Skeleton } from '../skeleton';
import { DataTableFilterChips, DataTableFilterPopover, type FilterColumn } from './filters';
import {
  AlertIcon,
  ColumnsIcon,
  InboxIcon,
  RefreshIcon,
  SearchIcon,
  SearchOffIcon,
  SortIcon,
} from './icons';
import { DataTablePagination } from './pagination';
import {
  defaultLabels,
  type DataTableColumn,
  type DataTableEmptyState,
  type DataTableFilterValue,
  type DataTableLabels,
  type DataTableState,
} from './types';
import {
  compareValues,
  getColumnValue,
  isEmptyFilter,
  matchesFilter,
  matchesSearch,
  nodeToText,
  resolveFilterOptions,
  valueToText,
} from './utils';

/* TanStack Table: faqat kerakli imkoniyatlar ro'yxatdan o'tadi */
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
  columnVisibilityFeature,
});

type Features = typeof features;
type RowData = Record<string, unknown>;
type TableRow = Row<Features, RowData>;

const ROW_HEIGHT = { comfortable: 52, compact: 40 } as const;
const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];

export type DataTableDensity = 'comfortable' | 'compact';

export interface DataTableProps<T extends object> extends Omit<
  ComponentProps<'div'>,
  'children' | 'onChange'
> {
  data: readonly T[];
  columns: readonly DataTableColumn<T>[];
  /** Qator id'si (tanlash uchun). Default — `row.id`, bo'lmasa tartib raqami */
  getRowId?: (row: T, index: number) => string;
  /** Jadval nomi (ekran o'quvchi uchun) */
  label?: string;

  /** Umumiy qidiruv (300ms debounce, o'zbek harflariga sezgir emas) */
  searchable?: boolean;
  /** Chapda Checkbox; tanlanganda ommaviy amallar paneli */
  selectable?: boolean;
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectionChange?: (ids: string[], rows: T[]) => void;
  /** Ommaviy amallar: "3 ta tanlandi · O'chirish · Eksport" */
  bulkActions?: (rows: T[], clearSelection: () => void) => ReactNode;

  /** Sahifalash (`false` — o'chiq). `virtual` bilan birga ishlatilmaydi */
  pagination?: false | { pageSize?: number; pageSizeOptions?: number[] };
  /** Virtual scroll — sahifalash o'rniga, faqat ko'rinadigan qatorlar chiziladi */
  virtual?: boolean | { overscan?: number };
  /**
   * Jadval qismining maksimal balandligi. `virtual` da default 480.
   * Sarlavha faqat shu cheklov (yoki `virtual`) bo'lganda yopishqoq bo'ladi: aks holda jadval
   * gorizontal scroll konteynerida turadi va sarlavha sahifa scroll'iga yopishmaydi.
   */
  maxHeight?: number | string;
  /** "Ustunlar" menyusi (default `true`) */
  columnToggle?: boolean;

  /** Server rejimi: saralash/filtr/sahifa ma'lumotga qo'llanmaydi, `onStateChange` orqali tashqariga */
  manual?: boolean;
  /** `manual` da jami yozuvlar soni */
  rowCount?: number;
  initialState?: Partial<DataTableState>;
  onStateChange?: (state: DataTableState) => void;

  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => ReactNode;
  /** Qidiruv yonidagi qo'shimcha elementlar (masalan "Qo'shish" tugmasi) */
  toolbar?: ReactNode;

  /** Yuklanish: ma'lumot yo'q bo'lsa — Skeleton, bor bo'lsa — shaffof + progress chiziq */
  loading?: boolean;
  /** Xato (matn yoki `true`) */
  error?: ReactNode;
  onRetry?: () => void;
  empty?: DataTableEmptyState;

  density?: DataTableDensity;
  /** Gorizontal scroll'da birinchi ustun joyida turadi */
  stickyFirstColumn?: boolean;
  /** Telefonda (< 640px) qatorlar karta ko'rinishida */
  mobileView?: 'table' | 'cards';
  labels?: DataTableLabels;
  /** `<table>` klassi (`className` — ildizga) */
  tableClassName?: string;
}

const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' } as const;

function cellAlign<T>(column: DataTableColumn<T>) {
  const align = column.align ?? (column.numeric ? 'right' : 'left');
  return cn(alignClass[align], (column.numeric || align === 'right') && 'tabular-nums');
}

function widthStyle(width?: number | string): CSSProperties | undefined {
  return width === undefined ? undefined : { width, minWidth: width };
}

const toRecord = (ids?: string[]) =>
  ids ? (Object.fromEntries(ids.map((id) => [id, true])) as RowSelectionState) : undefined;

const toColumnFilters = (filters: Record<string, DataTableFilterValue>): ColumnFiltersState =>
  Object.entries(filters).map(([id, value]) => ({ id, value }));

/** Ma'lumotlar jadvali: saralash, qidiruv, filtrlar, tanlash, sahifalash (TanStack Table) */
export function DataTable<T extends object>({
  data,
  columns,
  getRowId,
  label,
  searchable = false,
  selectable = false,
  selectedIds,
  defaultSelectedIds,
  onSelectionChange,
  bulkActions,
  pagination: paginationProp,
  virtual = false,
  maxHeight,
  columnToggle = true,
  manual = false,
  rowCount,
  initialState,
  onStateChange,
  onRowClick,
  rowActions,
  toolbar,
  loading = false,
  error,
  onRetry,
  empty,
  density = 'comfortable',
  stickyFirstColumn = false,
  mobileView = 'table',
  labels: labelsProp,
  className,
  tableClassName,
  ...props
}: DataTableProps<T>) {
  const labels = { ...defaultLabels, ...labelsProp };
  const paged = paginationProp !== undefined && paginationProp !== false && !virtual;
  const pageSizeOptions = (paginationProp && paginationProp.pageSizeOptions) || DEFAULT_PAGE_SIZES;
  const rows = data as unknown as RowData[];
  const columnMap = useMemo(() => new Map(columns.map((c) => [c.key, c])), [columns]);

  /* Holat */
  const [sorting, setSorting] = useState<SortingState>(initialState?.sorting ?? []);
  const [filters, setFilters] = useState<Record<string, DataTableFilterValue>>(
    initialState?.filters ?? {},
  );
  const [search, setSearch] = useState(initialState?.search ?? '');
  const [searchInput, setSearchInput] = useState(search);
  const [pagination, setPagination] = useState<PaginationState>(() => ({
    pageIndex: initialState?.pagination?.pageIndex ?? 0,
    pageSize:
      initialState?.pagination?.pageSize ??
      (paginationProp ? paginationProp.pageSize : undefined) ??
      10,
  }));
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(() =>
    Object.fromEntries(columns.filter((c) => c.hidden).map((c) => [c.key, false])),
  );

  const rowIdOf = (row: T, index: number) => {
    if (getRowId) return getRowId(row, index);
    const id = (row as { id?: unknown }).id;
    return id != null ? String(id) : String(index);
  };
  const [rowSelection = {}, setRowSelection] = useControllableState<RowSelectionState>({
    value: useMemo(() => toRecord(selectedIds), [selectedIds]),
    defaultValue: toRecord(defaultSelectedIds) ?? {},
    onChange: (next) => {
      const ids = Object.keys(next).filter((id) => next[id]);
      const set = new Set(ids);
      onSelectionChange?.(
        ids,
        data.filter((row, i) => set.has(rowIdOf(row, i))),
      );
    },
  });

  const resetPage = () => setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));

  const applySearch = useDebouncedCallback((q: string) => {
    setSearch(q);
    resetPage();
  }, 300);

  /* TanStack ustunlari */
  const columnDefs = useMemo(
    () =>
      columns.map((col): ColumnDef<Features, RowData, unknown> => ({
        id: col.key,
        accessorFn: (row) => getColumnValue(col, row as T),
        enableSorting: Boolean(col.sortable),
        sortFn: (a, b, id) => compareValues(a.getValue(id), b.getValue(id)),
        enableColumnFilter: Boolean(col.filter),
        filterFn: (row, id, value) => matchesFilter(col.filter, row.getValue(id), value),
        enableGlobalFilter: col.searchable !== false,
        enableHiding: col.hideable !== false,
      })),
    [columns],
  );
  const globalFilterFn = useMemo<FilterFn<Features, RowData>>(
    () => (row, columnId, query: string) => {
      const col = columnMap.get(columnId);
      return col ? matchesSearch(col, row.original as T, query) : false;
    },
    [columnMap],
  );
  const columnFilters = useMemo(() => toColumnFilters(filters), [filters]);

  const table = useTable({
    features,
    columns: columnDefs,
    data: rows,
    getRowId: (row: RowData, index: number) => rowIdOf(row as T, index),
    state: {
      sorting,
      columnFilters,
      globalFilter: search,
      pagination,
      rowSelection,
      columnVisibility,
    },
    onSortingChange: (updater) => {
      setSorting(updater);
      resetPage();
    },
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    manualSorting: manual,
    manualFiltering: manual,
    manualPagination: manual || !paged,
    rowCount: manual ? (rowCount ?? data.length) : undefined,
    autoResetPageIndex: false,
    enableMultiSort: true,
    enableSortingRemoval: true,
    sortDescFirst: false,
    isMultiSortEvent: (e) => Boolean((e as { shiftKey?: boolean } | undefined)?.shiftKey),
    globalFilterFn,
    enableRowSelection: selectable,
    isRowRangeSelectionEvent: (e) =>
      Boolean((e as { nativeEvent?: { shiftKey?: boolean } }).nativeEvent?.shiftKey),
  });

  /* Tashqariga holat (server rejimi uchun) */
  const outsideState = useMemo<DataTableState>(
    () => ({ sorting, search, filters, pagination }),
    [sorting, search, filters, pagination],
  );
  const onStateChangeRef = useRef(onStateChange);
  useLayoutEffect(() => {
    onStateChangeRef.current = onStateChange;
  });
  // Faqat haqiqiy o'zgarishda (StrictMode'dagi qayta effektda emas)
  const prevState = useRef(outsideState);
  useEffect(() => {
    const prev = prevState.current;
    const same = (Object.keys(prev) as Array<keyof DataTableState>).every(
      (k) => prev[k] === outsideState[k],
    );
    if (same) return;
    prevState.current = outsideState;
    onStateChangeRef.current?.(outsideState);
  }, [outsideState]);

  /* Hisoblangan qiymatlar */
  const total = table.getRowCount();
  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize));
  if (paged && !loading && pagination.pageIndex > pageCount - 1) {
    // O'chirish yoki filtrdan keyin sahifa chegaradan chiqib qolsa — oxirgi sahifaga
    setPagination({ ...pagination, pageIndex: pageCount - 1 });
  }
  const visibleRows: TableRow[] = virtual
    ? table.getPrePaginatedRowModel().rows
    : table.getRowModel().rows;
  const visibleColumns = table
    .getVisibleLeafColumns()
    .map((c) => columnMap.get(c.id))
    .filter((c): c is DataTableColumn<T> => c !== undefined);

  const filterColumns: FilterColumn<T>[] = useMemo(
    () =>
      columns
        .filter((c) => c.filter)
        .map((column) => ({ column, options: resolveFilterOptions(column, data, !manual) })),
    [columns, data, manual],
  );
  const activeFilters = Object.values(filters).filter((v) => !isEmptyFilter(v)).length;
  const filtered = Boolean(search) || activeFilters > 0;

  const setFilter = (id: string, value: DataTableFilterValue | undefined) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value === undefined || isEmptyFilter(value)) delete next[id];
      else next[id] = value;
      return next;
    });
    resetPage();
  };
  const clearFilters = () => {
    applySearch.cancel();
    setSearchInput('');
    setSearch('');
    setFilters({});
    resetPage();
  };

  const selectedCount = Object.keys(rowSelection).filter((id) => rowSelection[id]).length;
  const clearSelection = () => setRowSelection({});
  const selectedRows = bulkActions ? data.filter((row, i) => rowSelection[rowIdOf(row, i)]) : [];

  const isMobile = useMediaQuery(MOBILE_QUERY);
  const cards = mobileView === 'cards' && isMobile;

  /* Ko'rinish */
  const rowHeight = ROW_HEIGHT[density];
  // Virtual scroll elementni state orqali oladi (ref bolaning effektidan keyin ulanadi)
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const scrollMaxHeight = maxHeight ?? (virtual ? 480 : undefined);
  const hasActions = Boolean(rowActions);
  const colSpan = visibleColumns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0);
  const firstLoad = loading && data.length === 0;
  const refetching = loading && data.length > 0;
  const hideableColumns = columns.filter((c) => c.hideable !== false);
  const showColumnToggle = columnToggle && hideableColumns.length > 1;
  const hasToolbar =
    searchable || filterColumns.length > 0 || showColumnToggle || toolbar != null || selectable;
  const bulkMode = selectable && selectedCount > 0;

  const stickyCell =
    'sticky z-1 bg-surface group-hover/row:bg-surface-muted group-data-selected/row:bg-primary-soft';
  const stickyLeft = (index: number): string | undefined => {
    if (!stickyFirstColumn) return undefined;
    if (selectable && index === -1) return cn(stickyCell, 'left-0');
    if (index === 0) return cn(stickyCell, selectable ? 'left-11' : 'left-0');
    return undefined;
  };

  const handleRowKeyDown = (e: KeyboardEvent<HTMLElement>, row: TableRow) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' && onRowClick) {
      e.preventDefault();
      onRowClick(row.original as T);
    } else if (e.key === ' ' && selectable) {
      e.preventDefault();
      row.toggleSelected();
    }
  };
  const stop = (e: MouseEvent) => e.stopPropagation();

  const renderCellContent = (column: DataTableColumn<T>, row: TableRow) =>
    column.cell
      ? column.cell(row.original as T)
      : valueToText(getColumnValue(column, row.original as T));

  const renderRow = (row: TableRow, extra?: { index: number; measure?: boolean }) => {
    const selected = row.getIsSelected();
    const interactive = Boolean(onRowClick) || selectable;
    return (
      <tr
        key={row.id}
        data-row-id={row.id}
        data-selected={selected ? '' : undefined}
        aria-rowindex={extra ? extra.index + 2 : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={onRowClick ? () => onRowClick(row.original as T) : undefined}
        onKeyDown={interactive ? (e) => handleRowKeyDown(e, row) : undefined}
        style={{ height: rowHeight }}
        className={cn(
          'group/row border-t border-border transition-colors duration-fast',
          'hover:bg-surface-muted data-selected:bg-primary-soft',
          onRowClick && 'cursor-pointer',
          'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
        )}
      >
        {selectable && (
          <td className={cn('w-11 pr-0 pl-3', stickyLeft(-1))} onClick={stop}>
            <Checkbox
              size="sm"
              aria-label={`${labels.selectRow}: ${row.id}`}
              checked={selected}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
              className="align-middle"
            />
          </td>
        )}
        {visibleColumns.map((column, i) => (
          <td
            key={column.key}
            className={cn(
              'px-3 whitespace-nowrap',
              cellAlign(column),
              stickyLeft(i),
              column.className,
            )}
            style={widthStyle(column.width)}
          >
            {renderCellContent(column, row)}
          </td>
        ))}
        {hasActions && (
          <td className="w-12 pr-2 pl-0 text-right" onClick={stop}>
            {rowActions?.(row.original as T)}
          </td>
        )}
      </tr>
    );
  };

  const stateRow = (content: ReactNode) => (
    <tr className="border-t border-border">
      <td colSpan={colSpan}>{content}</td>
    </tr>
  );

  const renderBody = () => {
    if (error && !loading) {
      return stateRow(
        <StateMessage
          tone="danger"
          icon={<AlertIcon />}
          title={labels.errorTitle}
          description={typeof error === 'boolean' ? undefined : error}
          action={
            onRetry && (
              <Button size="sm" variant="soft" leftIcon={<RefreshIcon />} onClick={onRetry}>
                {labels.retry}
              </Button>
            )
          }
        />,
      );
    }
    if (firstLoad) {
      const count = paged ? pagination.pageSize : 8;
      return Array.from({ length: count }, (_, r) => (
        <tr key={`sk${r}`} className="border-t border-border" style={{ height: rowHeight }}>
          {selectable && (
            <td className="w-11 pr-0 pl-3">
              <Skeleton className="size-4 rounded-sm" />
            </td>
          )}
          {visibleColumns.map((column, i) => (
            <td key={column.key} className="px-3">
              <Skeleton
                className={cn('h-3.5', column.numeric && 'ml-auto')}
                style={{ width: `${45 + ((r * 7 + i * 13) % 40)}%` }}
              />
            </td>
          ))}
          {hasActions && <td className="w-12" />}
        </tr>
      ));
    }
    if (visibleRows.length === 0) {
      return stateRow(
        filtered ? (
          <StateMessage
            icon={<SearchOffIcon />}
            title={labels.noResultsTitle}
            description={labels.noResultsDescription}
            action={
              <Button size="sm" variant="soft" onClick={clearFilters}>
                {labels.clearFilters}
              </Button>
            }
          />
        ) : (
          <StateMessage
            icon={empty?.icon ?? <InboxIcon />}
            title={empty?.title ?? labels.emptyTitle}
            description={empty?.description ?? labels.emptyDescription}
            action={empty?.action}
          />
        ),
      );
    }
    if (virtual) {
      return (
        <VirtualRows
          rows={visibleRows}
          scrollEl={scrollEl}
          rowHeight={rowHeight}
          overscan={typeof virtual === 'object' ? virtual.overscan : undefined}
          viewport={typeof scrollMaxHeight === 'number' ? scrollMaxHeight : 480}
          colSpan={colSpan}
          renderRow={renderRow}
        />
      );
    }
    return visibleRows.map((row) => renderRow(row));
  };

  /* Sarlavha */
  const allSelected = table.getIsAllPageRowsSelected();
  const someSelected = table.getIsSomePageRowsSelected();
  const header = (
    <thead>
      <tr>
        {selectable && (
          <th
            scope="col"
            className={cn(
              'sticky top-0 z-2 h-10 w-11 bg-surface-muted pr-0 pl-3 text-left',
              stickyFirstColumn && 'left-0 z-3',
            )}
          >
            <Checkbox
              size="sm"
              aria-label={labels.selectAll}
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              disabled={visibleRows.length === 0}
              onCheckedChange={() => table.toggleAllPageRowsSelected(!allSelected)}
              className="align-middle"
            />
          </th>
        )}
        {visibleColumns.map((column, i) => {
          const tColumn = table.getColumn(column.key);
          const dir = tColumn?.getIsSorted() ?? false;
          const sortIndex = tColumn?.getSortIndex() ?? -1;
          return (
            <th
              key={column.key}
              scope="col"
              aria-sort={
                column.sortable
                  ? dir === 'asc'
                    ? 'ascending'
                    : dir === 'desc'
                      ? 'descending'
                      : 'none'
                  : undefined
              }
              style={widthStyle(column.width)}
              className={cn(
                'sticky top-0 z-2 h-10 bg-surface-muted px-3 text-xs font-medium whitespace-nowrap text-text-muted',
                cellAlign(column),
                stickyFirstColumn && i === 0 && cn('z-3', selectable ? 'left-11' : 'left-0'),
              )}
            >
              {column.sortable && tColumn ? (
                <button
                  type="button"
                  data-sorted={dir || undefined}
                  onMouseDown={(e) => {
                    // Shift + bosishda matn belgilanmasin
                    if (e.shiftKey) e.preventDefault();
                  }}
                  onClick={tColumn.getToggleSortingHandler()}
                  className={cn(
                    'group/sort -mx-1 inline-flex cursor-pointer items-center gap-1 rounded-sm border-0 bg-transparent px-1 py-0.5 font-sans text-xs font-medium text-text-muted',
                    'transition-colors duration-fast hover:text-text focus-ring data-sorted:text-text',
                  )}
                >
                  {column.header}
                  <span
                    className={cn(
                      'inline-flex size-3.5 shrink-0 [&_svg]:size-3.5',
                      dir ? 'text-primary' : 'opacity-50 group-hover/sort:opacity-80',
                    )}
                  >
                    <SortIcon dir={dir} />
                  </span>
                  {dir && sorting.length > 1 && (
                    <span className="text-[10px] text-primary tabular-nums">{sortIndex + 1}</span>
                  )}
                </button>
              ) : (
                column.header
              )}
            </th>
          );
        })}
        {hasActions && (
          <th scope="col" className="sticky top-0 z-2 h-10 w-12 bg-surface-muted">
            <span className="sr-only">{labels.rowActions}</span>
          </th>
        )}
      </tr>
    </thead>
  );

  /* Asboblar paneli */
  const toolbarNode = hasToolbar && (
    <div data-slot="data-table-toolbar" className="flex min-h-16 flex-wrap items-center gap-2 p-3">
      {bulkMode ? (
        <div data-slot="data-table-bulk" className="flex flex-1 flex-wrap items-center gap-2">
          <span aria-live="polite" className="mr-1 text-sm font-medium text-text">
            {labels.selected(selectedCount)}
          </span>
          {bulkActions?.(selectedRows, clearSelection)}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={clearSelection}>
            {labels.clearSelection}
          </Button>
        </div>
      ) : (
        <>
          {searchable && (
            <Input
              type="search"
              aria-label={labels.searchAria}
              placeholder={labels.search}
              leftIcon={<SearchIcon />}
              clearable
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                applySearch(e.target.value);
              }}
              onClear={() => applySearch.flush()}
              className="max-w-80 min-w-50 flex-1"
              inputClassName="[&::-webkit-search-cancel-button]:appearance-none"
            />
          )}
          {filterColumns.length > 0 && (
            <DataTableFilterPopover
              columns={filterColumns}
              filters={filters}
              onFilterChange={setFilter}
              onClear={clearFilters}
              labels={labels}
            />
          )}
          <DataTableFilterChips
            columns={filterColumns}
            filters={filters}
            onFilterChange={setFilter}
            labels={labels}
          />
          <div className="ml-auto flex items-center gap-2">
            {toolbar}
            {showColumnToggle && (
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Button variant="outline" leftIcon={<ColumnsIcon />}>
                    {labels.columns}
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  {hideableColumns.map((column) => {
                    const tColumn = table.getColumn(column.key);
                    const visible = tColumn?.getIsVisible() ?? true;
                    const lastVisible = visible && visibleColumns.length === 1;
                    return (
                      <DropdownMenu.CheckboxItem
                        key={column.key}
                        checked={visible}
                        disabled={lastVisible}
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={(v) => tColumn?.toggleVisibility(Boolean(v))}
                      >
                        {nodeToText(column.header) || column.key}
                      </DropdownMenu.CheckboxItem>
                    );
                  })}
                </DropdownMenu.Content>
              </DropdownMenu>
            )}
          </div>
        </>
      )}
    </div>
  );

  /* Telefon: kartalar */
  const stateOnly = Boolean(error) || (!firstLoad && visibleRows.length === 0);
  const cardsNode = cards && !stateOnly && (
    <ul
      aria-label={label}
      aria-busy={loading || undefined}
      className={cn(
        'flex flex-col gap-2 border-t border-border p-3',
        refetching && 'opacity-60 transition-opacity',
      )}
    >
      {firstLoad
        ? Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="rounded-lg border border-border p-3">
              <Skeleton.Text lines={3} />
            </li>
          ))
        : visibleRows.map((row) => {
            const selected = row.getIsSelected();
            return (
              <li
                key={row.id}
                data-selected={selected ? '' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row.original as T) : undefined}
                onKeyDown={(e) => handleRowKeyDown(e, row)}
                className={cn(
                  'flex gap-3 rounded-lg border border-border bg-surface p-3 data-selected:border-primary data-selected:bg-primary-soft',
                  onRowClick && 'cursor-pointer',
                  'focus-ring',
                )}
              >
                {selectable && (
                  <span onClick={stop}>
                    <Checkbox
                      size="sm"
                      aria-label={`${labels.selectRow}: ${row.id}`}
                      checked={selected}
                      onChange={row.getToggleSelectedHandler()}
                    />
                  </span>
                )}
                <dl className="grid min-w-0 flex-1 grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  {visibleColumns.map((column) => (
                    <div key={column.key} className="contents">
                      <dt className="text-xs text-text-muted">{column.header}</dt>
                      <dd
                        className={cn(
                          'min-w-0 truncate text-right',
                          column.numeric && 'tabular-nums',
                        )}
                      >
                        {renderCellContent(column, row)}
                      </dd>
                    </div>
                  ))}
                </dl>
                {hasActions && <span onClick={stop}>{rowActions?.(row.original as T)}</span>}
              </li>
            );
          })}
    </ul>
  );

  return (
    <div
      data-slot="data-table"
      data-density={density}
      data-loading={loading ? '' : undefined}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-surface font-sans text-sm text-text',
        className,
      )}
      {...props}
    >
      {toolbarNode}
      <div className="relative">
        {refetching && (
          <div
            role="progressbar"
            aria-label={labels.loading}
            className="absolute inset-x-0 top-0 z-4 h-0.5 overflow-hidden bg-primary-soft"
          >
            <div className="h-full w-full animate-shimmer bg-linear-to-r from-transparent via-primary to-transparent" />
          </div>
        )}
        {cardsNode}
        {(!cards || stateOnly) && (
          <div
            ref={setScrollEl}
            data-slot="data-table-scroll"
            className={cn(
              // Balandlik cheklanmagan bo'lsa — faqat gorizontal scroll
              scrollMaxHeight !== undefined ? 'overflow-auto' : 'overflow-x-auto overflow-y-hidden',
              cards && 'border-t border-border',
            )}
            style={scrollMaxHeight !== undefined ? { maxHeight: scrollMaxHeight } : undefined}
          >
            <table
              aria-label={label}
              aria-busy={loading || undefined}
              aria-rowcount={virtual ? visibleRows.length + 1 : undefined}
              className={cn('w-full border-collapse text-sm text-text', tableClassName)}
            >
              {!cards && header}
              <tbody
                className={cn(
                  'transition-opacity duration-base',
                  refetching && 'pointer-events-none opacity-60',
                )}
              >
                {renderBody()}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {paged && !firstLoad && !error && (
        <DataTablePagination
          total={total}
          pageIndex={Math.min(pagination.pageIndex, pageCount - 1)}
          pageSize={pagination.pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageChange={(pageIndex) => setPagination((p) => ({ ...p, pageIndex }))}
          onPageSizeChange={(pageSize) => setPagination({ pageIndex: 0, pageSize })}
          labels={labels}
        />
      )}
      {virtual && !firstLoad && !error && visibleRows.length > 0 && (
        <div
          data-slot="data-table-footer"
          className="border-t border-border px-3 py-2.5 text-[13px] text-text-muted tabular-nums"
        >
          {labels.total(visibleRows.length)}
        </div>
      )}
    </div>
  );
}

/* Holat xabari: bo'sh / topilmadi / xato */
function StateMessage({
  icon,
  title,
  description,
  action,
  tone = 'neutral',
}: {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tone?: 'neutral' | 'danger';
}) {
  return (
    <div
      data-slot="data-table-state"
      role={tone === 'danger' ? 'alert' : 'status'}
      className="flex flex-col items-center gap-1.5 px-4 py-12 text-center"
    >
      <span
        aria-hidden="true"
        className={cn(
          'mb-1 inline-flex [&_svg]:size-8',
          tone === 'danger' ? 'text-danger' : 'text-text-faint',
        )}
      >
        {icon}
      </span>
      <p className="text-[15px] font-semibold text-text">{title}</p>
      {description && <p className="text-[13px] text-text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* Virtual qatorlar: faqat ko'rinadiganlari chiziladi, yuqori/pastda bo'sh joy qatorlari */
function VirtualRows({
  rows,
  scrollEl,
  rowHeight,
  overscan = 8,
  viewport,
  colSpan,
  renderRow,
}: {
  rows: TableRow[];
  scrollEl: HTMLDivElement | null;
  rowHeight: number;
  overscan?: number;
  viewport: number;
  colSpan: number;
  renderRow: (row: TableRow, extra: { index: number }) => ReactNode;
}) {
  // eslint-disable-next-line react-hooks/incompatible-library -- virtualizer har render'da yangilanadi
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollEl,
    estimateSize: () => rowHeight,
    overscan,
    // Sarlavha balandligi (40px) — scroll'dan oldingi joy
    scrollMargin: 40,
    initialRect: { width: 0, height: viewport },
    getItemKey: (index) => rows[index]?.id ?? index,
  });
  const items = virtualizer.getVirtualItems();
  const margin = virtualizer.options.scrollMargin;
  const first = items[0];
  const last = items[items.length - 1];
  const start = first ? first.start - margin : 0;
  const end = last ? virtualizer.getTotalSize() - (last.end - margin) : 0;

  return (
    <>
      {start > 0 && (
        <tr aria-hidden="true" style={{ height: start }}>
          <td colSpan={colSpan} className="p-0" />
        </tr>
      )}
      {items.map((item) => {
        const row = rows[item.index];
        return row ? renderRow(row, { index: item.index }) : null;
      })}
      {end > 0 && (
        <tr aria-hidden="true" style={{ height: end }}>
          <td colSpan={colSpan} className="p-0" />
        </tr>
      )}
    </>
  );
}
