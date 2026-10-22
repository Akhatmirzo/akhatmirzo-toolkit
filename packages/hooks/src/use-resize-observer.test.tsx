import { act, cleanup, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useResizeObserver, type UseResizeObserverOptions } from './use-resize-observer';

type Callback = (entries: ResizeObserverEntry[]) => void;

class MockResizeObserver {
  static instances: MockResizeObserver[] = [];
  observed: Element[] = [];
  options: ResizeObserverOptions | undefined;
  disconnected = false;
  constructor(public callback: Callback) {
    MockResizeObserver.instances.push(this);
  }
  observe(el: Element, options?: ResizeObserverOptions) {
    this.observed.push(el);
    this.options = options;
  }
  unobserve() {}
  disconnect() {
    this.disconnected = true;
  }
  emit(width: number, height: number) {
    const size = [{ inlineSize: width, blockSize: height }];
    this.callback([
      {
        contentBoxSize: size,
        borderBoxSize: [{ inlineSize: width + 2, blockSize: height + 2 }],
        devicePixelContentBoxSize: size,
        contentRect: { width, height },
      } as unknown as ResizeObserverEntry,
    ]);
  }
}

let frames: FrameRequestCallback[] = [];
function flushFrames() {
  const list = frames;
  frames = [];
  act(() => list.forEach((cb) => cb(0)));
}

beforeEach(() => {
  MockResizeObserver.instances = [];
  frames = [];
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function Demo(props: UseResizeObserverOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(ref, props);
  return <div ref={ref} data-testid="box" data-size={JSON.stringify(size)} />;
}

const read = () => JSON.parse(screen.getByTestId('box').dataset.size!) as unknown;

describe('useResizeObserver', () => {
  it('o‘lchamni rAF bilan birlashtirib yangilaydi', () => {
    render(<Demo />);
    expect(read()).toBeNull();
    const ro = MockResizeObserver.instances[0]!;
    expect(ro.observed).toHaveLength(1);
    act(() => {
      ro.emit(100, 50);
      ro.emit(120, 60);
    });
    expect(frames).toHaveLength(1);
    expect(read()).toBeNull();
    flushFrames();
    expect(read()).toEqual({ width: 120, height: 60 });
  });

  it('box: border-box', () => {
    render(<Demo box="border-box" />);
    const ro = MockResizeObserver.instances[0]!;
    expect(ro.options).toEqual({ box: 'border-box' });
    act(() => ro.emit(10, 10));
    flushFrames();
    expect(read()).toEqual({ width: 12, height: 12 });
  });

  it('unmount’da disconnect va kutilayotgan kadr bekor qilinadi', () => {
    const { unmount } = render(<Demo />);
    const ro = MockResizeObserver.instances[0]!;
    act(() => ro.emit(1, 1));
    unmount();
    expect(ro.disconnected).toBe(true);
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it('ResizeObserver yo‘q bo‘lsa null', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    render(<Demo />);
    expect(read()).toBeNull();
  });

  it('SSR: renderToString — null, xatosiz', () => {
    function Ssr() {
      const ref = useRef<HTMLDivElement>(null);
      const size = useResizeObserver(ref);
      return <div ref={ref}>{size === null ? 'null' : 'size'}</div>;
    }
    expect(renderToString(<Ssr />)).toContain('null');
  });
});
