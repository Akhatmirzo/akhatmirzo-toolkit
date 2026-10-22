// @vitest-environment node
import { useRef } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  useCountdown,
  useDocumentVisibility,
  useEventListener,
  useFocusTrap,
  useIdle,
  useInfiniteScroll,
  useInterval,
  useIsClient,
  useLongPress,
  useOnline,
  usePrevious,
  useResizeObserver,
  useScrollLock,
  useStep,
  useTimeout,
} from './index';

// Haqiqiy server muhiti: `window` / `document` yo'q — render paytida ularga murojaat bo'lmasligi kerak
function All() {
  const ref = useRef<HTMLDivElement>(null);
  useEventListener('resize', () => {});
  useEventListener(ref, 'click', () => {});
  const size = useResizeObserver(ref);
  useScrollLock(true);
  useFocusTrap(ref, true);
  const handlers = useLongPress(() => {});
  const visibility = useDocumentVisibility();
  const isClient = useIsClient();
  useInterval(() => {}, 1000);
  useTimeout(() => {}, 1000);
  const { formatted } = useCountdown(65);
  const idle = useIdle(1000);
  const { step } = useStep(3);
  const { sentinelRef } = useInfiniteScroll({
    hasMore: true,
    loading: false,
    onLoadMore: () => {},
  });
  const prev = usePrevious(1);
  const online = useOnline();
  return (
    <div ref={ref} {...handlers}>
      {[
        size === null,
        visibility,
        isClient,
        formatted,
        idle,
        step,
        prev === undefined,
        online,
      ].join('|')}
      <span ref={sentinelRef} />
    </div>
  );
}

describe('SSR (node muhiti)', () => {
  it('barcha yangi hooklar renderToString da xatosiz, server qiymatlari bilan', () => {
    expect(typeof window).toBe('undefined');
    expect(renderToString(<All />)).toContain('true|visible|false|1:05|false|0|true|true');
  });
});
