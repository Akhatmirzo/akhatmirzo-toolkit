import { cleanup, fireEvent, render, renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useEventListener } from './use-event-listener';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function countCalls(spy: { mock: { calls: unknown[][] } }, type: string) {
  return spy.mock.calls.filter((c) => c[0] === type).length;
}

describe('useEventListener', () => {
  it('standart nishon — window (qisqa shakl)', () => {
    const handler = vi.fn();
    renderHook(() => useEventListener('resize', handler));
    window.dispatchEvent(new Event('resize'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('handler o‘zgarsa qayta obuna bo‘lmaydi, eng so‘nggisi chaqiriladi', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const first = vi.fn();
    const second = vi.fn();
    const { rerender, unmount } = renderHook(({ fn }) => useEventListener(window, 'scroll', fn), {
      initialProps: { fn: first },
    });
    rerender({ fn: second });
    rerender({ fn: second });
    expect(countCalls(add, 'scroll')).toBe(1);
    window.dispatchEvent(new Event('scroll'));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    unmount();
    expect(countCalls(remove, 'scroll')).toBe(1);
    window.dispatchEvent(new Event('scroll'));
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('document va enabled opsiyasi', () => {
    const handler = vi.fn();
    const { rerender } = renderHook(
      ({ enabled }) => useEventListener(document, 'keydown', handler, { enabled }),
      { initialProps: { enabled: false } },
    );
    fireEvent.keyDown(document, { key: 'a' });
    expect(handler).not.toHaveBeenCalled();
    rerender({ enabled: true });
    fireEvent.keyDown(document, { key: 'a' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('ref bilan elementga ulanadi, null — tinglamaydi', () => {
    const handler = vi.fn();
    function Demo() {
      const ref = useRef<HTMLButtonElement>(null);
      useEventListener(ref, 'click', (e) => handler(e.currentTarget));
      return <button ref={ref}>Bos</button>;
    }
    const { getByText } = render(<Demo />);
    fireEvent.click(getByText('Bos'));
    expect(handler).toHaveBeenCalledWith(getByText('Bos'));

    const nullHandler = vi.fn();
    renderHook(() => useEventListener(null, 'click', nullHandler));
    fireEvent.click(document.body);
    expect(nullHandler).not.toHaveBeenCalled();
  });

  it('SSR: renderToString xato bermaydi', () => {
    function Demo() {
      useEventListener('resize', () => {});
      return <p>ok</p>;
    }
    expect(renderToString(<Demo />)).toContain('ok');
  });
});
