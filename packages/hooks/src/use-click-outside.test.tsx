import { cleanup, fireEvent, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useClickOutside } from './use-click-outside';

function Demo({ handler, enabled = true }: { handler: () => void; enabled?: boolean }) {
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  useClickOutside([a, b], handler, enabled);
  return (
    <div>
      <div ref={a} data-testid="a">
        <span data-testid="a-child">ichki</span>
      </div>
      <div ref={b} data-testid="b" />
      <div data-testid="outside" />
    </div>
  );
}

function Single({ handler }: { handler: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, handler);
  return (
    <>
      <div ref={ref} data-testid="in" />
      <div data-testid="out" />
    </>
  );
}

afterEach(cleanup);

describe('useClickOutside', () => {
  it('tashqarida bosilganda chaqiriladi, ichkarida — yo‘q', () => {
    const handler = vi.fn();
    const { getByTestId } = render(<Demo handler={handler} />);
    fireEvent.pointerDown(getByTestId('a-child'));
    fireEvent.pointerDown(getByTestId('b'));
    expect(handler).not.toHaveBeenCalled();
    fireEvent.pointerDown(getByTestId('outside'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('bitta ref bilan ishlaydi', () => {
    const handler = vi.fn();
    const { getByTestId } = render(<Single handler={handler} />);
    fireEvent.pointerDown(getByTestId('in'));
    fireEvent.pointerDown(getByTestId('out'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('enabled=false bo‘lsa chaqirilmaydi', () => {
    const handler = vi.fn();
    const { getByTestId } = render(<Demo handler={handler} enabled={false} />);
    fireEvent.pointerDown(getByTestId('outside'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('unmount’dan keyin tinglamaydi', () => {
    const handler = vi.fn();
    const { unmount } = render(<Demo handler={handler} />);
    unmount();
    fireEvent.pointerDown(document.body);
    expect(handler).not.toHaveBeenCalled();
  });
});
