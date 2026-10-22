import { act, cleanup, fireEvent, render, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLongPress, type UseLongPressOptions } from './use-long-press';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function Demo({ cb, ...options }: { cb: () => void } & UseLongPressOptions<HTMLButtonElement>) {
  const handlers = useLongPress<HTMLButtonElement>(cb, options);
  return <button {...handlers}>Bosib turing</button>;
}

const down = (el: Element, init: PointerEventInit = {}) =>
  fireEvent.pointerDown(el, { button: 0, clientX: 0, clientY: 0, ...init });

describe('useLongPress', () => {
  it('delay o‘tgach chaqiriladi, onStart darhol', () => {
    const cb = vi.fn();
    const onStart = vi.fn();
    const { getByText } = render(<Demo cb={cb} onStart={onStart} />);
    down(getByText('Bosib turing'));
    expect(onStart).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(499));
    expect(cb).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('erta qo‘yib yuborilsa — onCancel, callback yo‘q', () => {
    const cb = vi.fn();
    const onCancel = vi.fn();
    const { getByText } = render(<Demo cb={cb} onCancel={onCancel} delay={300} />);
    const el = getByText('Bosib turing');
    down(el);
    act(() => vi.advanceTimersByTime(200));
    fireEvent.pointerUp(el);
    act(() => vi.advanceTimersByTime(500));
    expect(cb).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('harakat chegarasidan oshsa bekor qilinadi, kichik siljish — yo‘q', () => {
    const cb = vi.fn();
    const onCancel = vi.fn();
    const { getByText } = render(<Demo cb={cb} onCancel={onCancel} />);
    const el = getByText('Bosib turing');
    down(el);
    fireEvent.pointerMove(el, { clientX: 5, clientY: 5 });
    expect(onCancel).not.toHaveBeenCalled();
    fireEvent.pointerMove(el, { clientX: 12, clientY: 0 });
    expect(onCancel).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(1000));
    expect(cb).not.toHaveBeenCalled();
  });

  it('asosiy bo‘lmagan tugma va enabled=false e’tiborga olinmaydi', () => {
    const cb = vi.fn();
    const { getByText, rerender } = render(<Demo cb={cb} />);
    down(getByText('Bosib turing'), { button: 2 });
    act(() => vi.advanceTimersByTime(1000));
    expect(cb).not.toHaveBeenCalled();
    rerender(<Demo cb={cb} enabled={false} />);
    down(getByText('Bosib turing'));
    act(() => vi.advanceTimersByTime(1000));
    expect(cb).not.toHaveBeenCalled();
  });

  it('bosib turilganda contextmenu bloklanadi', () => {
    const { getByText } = render(<Demo cb={() => {}} />);
    const el = getByText('Bosib turing');
    expect(fireEvent.contextMenu(el)).toBe(true);
    down(el);
    expect(fireEvent.contextMenu(el)).toBe(false);
  });

  it('uzoq bosishdan keyingi o‘ng tugma kontekst menyusini bloklamaydi', () => {
    const { getByText } = render(<Demo cb={() => {}} />);
    const el = getByText('Bosib turing');
    down(el);
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.pointerUp(el);
    down(el, { button: 2 });
    expect(fireEvent.contextMenu(el)).toBe(true);
  });

  it('ishlovchilar barqaror; unmount’da taymer tozalanadi', () => {
    const cb = vi.fn();
    const { result, rerender } = renderHook(({ fn }) => useLongPress(fn), {
      initialProps: { fn: cb },
    });
    const first = result.current;
    rerender({ fn: vi.fn() });
    expect(result.current).toBe(first);

    const { getByText, unmount } = render(<Demo cb={cb} />);
    down(getByText('Bosib turing'));
    unmount();
    act(() => vi.advanceTimersByTime(1000));
    expect(cb).not.toHaveBeenCalled();
  });

  it('SSR: renderToString xato bermaydi', () => {
    expect(renderToString(<Demo cb={() => {}} />)).toContain('Bosib turing');
  });
});
