import { act, cleanup, render } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useIntersection, type UseIntersectionOptions } from './use-intersection';

type Callback = (entries: IntersectionObserverEntry[]) => void;
const instances: {
  cb: Callback;
  options?: IntersectionObserverInit;
  disconnect: () => void;
  observe: (el: Element) => void;
}[] = [];

class MockObserver {
  disconnect = vi.fn();
  observe = vi.fn();
  constructor(cb: Callback, options?: IntersectionObserverInit) {
    instances.push({ cb, options, disconnect: this.disconnect, observe: this.observe });
  }
}

afterEach(() => {
  cleanup();
  instances.length = 0;
  // @ts-expect-error — tozalash
  delete globalThis.IntersectionObserver;
});

function Demo(props: UseIntersectionOptions) {
  const [ref, entry] = useIntersection<HTMLDivElement>(props);
  const state = entry === null ? 'null' : String(entry.isIntersecting);
  return <div ref={ref} data-testid="target" data-state={state} />;
}

function Late() {
  const [shown, setShown] = useState(false);
  const [ref, entry] = useIntersection<HTMLDivElement>();
  const state = entry === null ? 'null' : String(entry.isIntersecting);
  return (
    <div data-testid="root" data-state={state}>
      <button type="button" onClick={() => setShown((s) => !s)}>
        toggle
      </button>
      {shown && <div ref={ref} data-testid="late" />}
    </div>
  );
}

describe('useIntersection', () => {
  it('IntersectionObserver yo‘q bo‘lsa null', () => {
    const { getByTestId } = render(<Demo />);
    expect(getByTestId('target').dataset.state).toBe('null');
  });

  it('oxirgi entry ni qaytaradi va unmount’da uziladi', () => {
    globalThis.IntersectionObserver = MockObserver as unknown as typeof IntersectionObserver;
    const { getByTestId, unmount } = render(<Demo rootMargin="100px" threshold={[0, 0.5]} />);
    expect(instances).toHaveLength(1);
    expect(instances[0]?.options).toMatchObject({ rootMargin: '100px', threshold: [0, 0.5] });
    const entry = (isIntersecting: boolean) => ({ isIntersecting }) as IntersectionObserverEntry;
    expect(getByTestId('target').dataset.state).toBe('null');
    act(() => instances[0]?.cb([entry(false), entry(true)]));
    expect(getByTestId('target').dataset.state).toBe('true');
    unmount();
    expect(instances[0]?.disconnect).toHaveBeenCalled();
  });

  it('threshold massivi har renderda yangi bo‘lsa ham qayta ulanmaydi', () => {
    globalThis.IntersectionObserver = MockObserver as unknown as typeof IntersectionObserver;
    const { rerender } = render(<Demo threshold={[0, 1]} />);
    rerender(<Demo threshold={[0, 1]} />);
    expect(instances).toHaveLength(1);
  });

  it('enabled=false bo‘lsa kuzatmaydi', () => {
    globalThis.IntersectionObserver = MockObserver as unknown as typeof IntersectionObserver;
    render(<Demo enabled={false} />);
    expect(instances).toHaveLength(0);
  });

  it('keyinroq mount bo‘lgan elementni kuzatadi, unmount’da uzadi va entry ni tozalaydi', () => {
    globalThis.IntersectionObserver = MockObserver as unknown as typeof IntersectionObserver;
    const { getByRole, getByTestId } = render(<Late />);
    expect(instances).toHaveLength(0);
    act(() => getByRole('button').click());
    expect(instances).toHaveLength(1);
    expect(instances[0]?.observe).toHaveBeenCalledWith(getByTestId('late'));
    act(() => instances[0]?.cb([{ isIntersecting: true } as IntersectionObserverEntry]));
    expect(getByTestId('root').dataset.state).toBe('true');
    act(() => getByRole('button').click());
    expect(instances[0]?.disconnect).toHaveBeenCalled();
    expect(getByTestId('root').dataset.state).toBe('null');
  });
});
