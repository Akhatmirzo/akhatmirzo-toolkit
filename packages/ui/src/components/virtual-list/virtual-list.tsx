import { useVirtualizer, type ScrollToOptions } from '@tanstack/react-virtual';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from '../spinner/spinner';

/** `ref` orqali boshqaruv */
export interface VirtualListHandle {
  /** Scroll konteyneri */
  element: HTMLDivElement | null;
  scrollToIndex: (index: number, options?: ScrollToOptions) => void;
  scrollToOffset: (offset: number, options?: ScrollToOptions) => void;
  /** Kesh tozalanadi va qatorlar qayta o'lchanadi */
  measure: () => void;
}

export interface VirtualListLabels {
  /** Pastki Spinner qatori matni */
  loadingMore?: string;
  /** Ro'yxat bo'sh bo'lganda */
  empty?: ReactNode;
}

const defaultLabels: Required<VirtualListLabels> = {
  loadingMore: 'Yuklanmoqda...',
  empty: "Ro'yxat bo'sh",
};

export interface VirtualListProps<T> extends Omit<
  ComponentProps<'div'>,
  'children' | 'ref' | 'onScroll'
> {
  items: readonly T[];
  renderItem: (item: T, index: number) => ReactNode;
  /** Taxminiy qator balandligi (px) */
  estimateSize: number | ((index: number) => number);
  /** Konteyner balandligi: px yoki CSS qiymat (`"60vh"`) */
  height: number | string;
  /** Ekrandan tashqarida qo'shimcha chiziladigan qatorlar. Default: 5 */
  overscan?: number;
  /** Qatorlar har xil balandlikda — haqiqiy o'lcham o'lchab olinadi */
  dynamic?: boolean;
  /** Qator kaliti; default — indeks */
  getItemKey?: (item: T, index: number) => string | number;
  /** Qatorlar orasidagi masofa (px) */
  gap?: number;
  /**
   * Oxiriga `endReachedThreshold` qator qolganda chaqiriladi (har `items.length` uchun bir marta).
   * `loadingMore` true → false bo'lsa-yu uzunlik o'zgarmasa (xato), qayta chaqiriladi.
   */
  onEndReached?: () => void;
  /** Default: 5 */
  endReachedThreshold?: number;
  /** Pastda Spinner qatori; bu paytda `onEndReached` chaqirilmaydi */
  loadingMore?: boolean;
  /** Bo'sh ro'yxat ko'rinishi */
  emptyState?: ReactNode;
  onScroll?: ComponentProps<'div'>['onScroll'];
  labels?: VirtualListLabels;
  /** Ro'yxat elementi (`role="list"`) klassi */
  listClassName?: string;
  /** DOM element emas, `VirtualListHandle`; DOM — `handle.element` */
  ref?: Ref<VirtualListHandle>;
}

/**
 * Katta ro'yxatlar uchun: faqat ko'rinadigan qatorlar chiziladi (TanStack Virtual).
 * Scroll konteyneri klaviatura bilan fokuslanadi (`↑ ↓ PageUp PageDown`).
 * `ref` — `VirtualListHandle` (scrollToIndex va h.k.), DOM element emas: u `handle.element` da.
 */
export function VirtualList<T>({
  items,
  renderItem,
  estimateSize,
  height,
  overscan = 5,
  dynamic = false,
  getItemKey,
  gap = 0,
  onEndReached,
  endReachedThreshold = 5,
  loadingMore = false,
  emptyState,
  labels,
  className,
  listClassName,
  style,
  ref,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: VirtualListProps<T>) {
  const text = { ...defaultLabels, ...labels };
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const count = items.length;

  const estimate = useCallback(
    (index: number) => (typeof estimateSize === 'function' ? estimateSize(index) : estimateSize),
    [estimateSize],
  );
  const itemKey = useCallback(
    (index: number) =>
      getItemKey && index < items.length ? getItemKey(items[index]!, index) : index,
    [getItemKey, items],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual o'z holatini boshqaradi
  const virtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: estimate,
    overscan,
    gap,
    getItemKey: itemKey,
    initialRect: typeof height === 'number' ? { width: 0, height } : undefined,
  });

  useImperativeHandle(
    ref,
    () => ({
      get element() {
        return scrollRef.current;
      },
      scrollToIndex: (index, options) => virtualizer.scrollToIndex(index, options),
      scrollToOffset: (offset, options) => virtualizer.scrollToOffset(offset, options),
      measure: () => virtualizer.measure(),
    }),
    [virtualizer],
  );

  const virtualItems = virtualizer.getVirtualItems();
  const lastVisible = virtualizer.range?.endIndex ?? virtualItems.at(-1)?.index ?? -1;

  // Bir xil uzunlik uchun qayta chaqirilmasin; yuklash tugab uzunlik o'zgarmasa — qayta urinish
  const reportedFor = useRef(-1);
  const prevLoading = useRef(loadingMore);
  useEffect(() => {
    if (prevLoading.current && !loadingMore) reportedFor.current = -1;
    prevLoading.current = loadingMore;
    if (!onEndReached || loadingMore || count === 0) return;
    if (lastVisible < count - 1 - endReachedThreshold) return;
    if (reportedFor.current === count) return;
    reportedFor.current = count;
    onEndReached();
  }, [lastVisible, count, loadingMore, endReachedThreshold, onEndReached]);

  const rootStyle: CSSProperties = { height, ...style };

  return (
    <div
      ref={scrollRef}
      data-slot="virtual-list"
      tabIndex={0}
      className={cn(
        'relative overflow-y-auto overscroll-contain font-sans text-text outline-none focus-ring',
        className,
      )}
      style={rootStyle}
      {...props}
    >
      {count === 0 && !loadingMore ? (
        <div
          data-slot="virtual-list-empty"
          className="flex h-full items-center justify-center p-6 text-sm text-text-muted"
        >
          {emptyState ?? text.empty}
        </div>
      ) : (
        <div
          role="list"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-busy={loadingMore || undefined}
          className={cn('relative w-full', listClassName)}
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualItems.map((v) => (
            <div
              key={v.key}
              role="listitem"
              aria-setsize={count}
              aria-posinset={v.index + 1}
              data-index={v.index}
              ref={dynamic ? virtualizer.measureElement : undefined}
              className="absolute top-0 left-0 w-full"
              style={{
                transform: `translateY(${v.start}px)`,
                height: dynamic ? undefined : v.size,
              }}
            >
              {renderItem(items[v.index]!, v.index)}
            </div>
          ))}
        </div>
      )}
      {loadingMore && (
        <div
          data-slot="virtual-list-loading"
          className="flex h-12 items-center justify-center gap-2 text-sm text-text-muted"
        >
          <Spinner size="sm" label={text.loadingMore} />
          <span aria-hidden="true">{text.loadingMore}</span>
        </div>
      )}
    </div>
  );
}
