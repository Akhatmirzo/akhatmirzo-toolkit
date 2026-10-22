import { useEffect } from 'react';
import { useLatestRef } from './internal';
import { useIntersection } from './use-intersection';

export interface UseInfiniteScrollOptions {
  /** Yana yuklanadigan ma'lumot bormi. `false` — kuzatish to'xtaydi. */
  hasMore: boolean;
  /** Hozir yuklanyaptimi. `true` bo'lganda `onLoadMore` chaqirilmaydi. */
  loading: boolean;
  /** Keyingi sahifani yuklash. */
  onLoadMore: () => void;
  /** Sentinel'ga qancha qolganda yuklash boshlanadi. Standart: `'200px'`. */
  rootMargin?: string;
}

/** `useInfiniteScroll` natijasi. */
export interface UseInfiniteScrollResult<T extends Element> {
  /** Ro'yxat oxiridagi sentinel elementga ulanadigan callback ref. */
  sentinelRef: (node: T | null) => void;
}

/**
 * Cheksiz scroll: ro'yxat oxiridagi sentinel ko'rinishga yaqinlashganda `onLoadMore` ni
 * chaqiradi. `useIntersection` ustida qurilgan. `loading` paytida va `hasMore: false` bo'lsa
 * chaqirilmaydi; yuklash tugagach sentinel hali ham ko'rinib tursa — yana chaqiriladi
 * (ekran to'lguncha).
 * @example
 * const { sentinelRef } = useInfiniteScroll({ hasMore, loading, onLoadMore: loadNextPage });
 * return (
 *   <>
 *     {items.map(renderItem)}
 *     <div ref={sentinelRef} />
 *   </>
 * );
 */
export function useInfiniteScroll<T extends Element = HTMLDivElement>({
  hasMore,
  loading,
  onLoadMore,
  rootMargin = '200px',
}: UseInfiniteScrollOptions): UseInfiniteScrollResult<T> {
  const onLoadMoreRef = useLatestRef(onLoadMore);
  const [sentinelRef, entry] = useIntersection<T>({ rootMargin, enabled: hasMore });
  const visible = entry?.isIntersecting ?? false;

  useEffect(() => {
    if (visible && hasMore && !loading) onLoadMoreRef.current();
  }, [visible, hasMore, loading, onLoadMoreRef]);

  return { sentinelRef };
}
