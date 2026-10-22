import { act, cleanup, render } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useInfiniteScroll, type UseInfiniteScrollOptions } from './use-infinite-scroll';

type Callback = (entries: IntersectionObserverEntry[]) => void;
const instances: { cb: Callback; options?: IntersectionObserverInit; disconnect: () => void }[] =
  [];

class MockObserver {
  disconnect = vi.fn();
  observe = vi.fn();
  constructor(cb: Callback, options?: IntersectionObserverInit) {
    instances.push({ cb, options, disconnect: this.disconnect });
  }
}

beforeEach(() => {
  globalThis.IntersectionObserver = MockObserver as unknown as typeof IntersectionObserver;
});
afterEach(() => {
  cleanup();
  instances.length = 0;
  // @ts-expect-error — tozalash
  delete globalThis.IntersectionObserver;
});

function List(props: UseInfiniteScrollOptions) {
  const { sentinelRef } = useInfiniteScroll(props);
  return <div ref={sentinelRef} />;
}

const intersect = (isIntersecting: boolean) =>
  act(() => instances.at(-1)?.cb([{ isIntersecting } as IntersectionObserverEntry]));

describe('useInfiniteScroll', () => {
  it('sentinel ko‘rinsa onLoadMore; standart rootMargin 200px', () => {
    const onLoadMore = vi.fn();
    render(<List hasMore loading={false} onLoadMore={onLoadMore} />);
    expect(instances[0]?.options?.rootMargin).toBe('200px');
    expect(onLoadMore).not.toHaveBeenCalled();
    intersect(true);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    intersect(false);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('loading paytida chaqirilmaydi; tugagach sentinel ko‘rinsa — yana', () => {
    const onLoadMore = vi.fn();
    const { rerender } = render(<List hasMore loading onLoadMore={onLoadMore} />);
    intersect(true);
    expect(onLoadMore).not.toHaveBeenCalled();
    rerender(<List hasMore loading={false} onLoadMore={onLoadMore} />);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    rerender(<List hasMore loading onLoadMore={onLoadMore} />);
    rerender(<List hasMore loading={false} onLoadMore={onLoadMore} />);
    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it('hasMore=false — kuzatmaydi va chaqirmaydi', () => {
    const onLoadMore = vi.fn();
    const { rerender } = render(
      <List hasMore loading={false} rootMargin="50px" onLoadMore={onLoadMore} />,
    );
    expect(instances[0]?.options?.rootMargin).toBe('50px');
    rerender(<List hasMore={false} loading={false} onLoadMore={onLoadMore} />);
    expect(instances[0]?.disconnect).toHaveBeenCalled();
    act(() => instances[0]?.cb([{ isIntersecting: true } as IntersectionObserverEntry]));
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('onLoadMore o‘zgarsa qayta ulanmaydi, eng so‘nggisi chaqiriladi', () => {
    const a = vi.fn();
    const b = vi.fn();
    const { rerender } = render(<List hasMore loading={false} onLoadMore={a} />);
    rerender(<List hasMore loading={false} onLoadMore={b} />);
    expect(instances).toHaveLength(1);
    intersect(true);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('StrictMode + sinxron onLoadMore: bitta ko‘rinishda bir marta', () => {
    const onLoadMore = vi.fn();
    render(
      <StrictMode>
        <List hasMore loading={false} onLoadMore={onLoadMore} />
      </StrictMode>,
    );
    intersect(true);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
