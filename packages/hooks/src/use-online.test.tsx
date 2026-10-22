import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useOnline } from './use-online';

afterEach(() => {
  vi.restoreAllMocks();
});

function Status() {
  return <span>{useOnline() ? 'online' : 'offline'}</span>;
}

describe('useOnline', () => {
  it('navigator.onLine ni qaytaradi va online/offline ga javob beradi', () => {
    const onLine = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const remove = vi.spyOn(window, 'removeEventListener');
    const { result, unmount } = renderHook(() => useOnline());
    expect(result.current).toBe(true);
    onLine.mockReturnValue(false);
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);
    onLine.mockReturnValue(true);
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
    unmount();
    expect(remove).toHaveBeenCalledWith('online', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('serverda true', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    expect(renderToString(<Status />)).toBe('<span>online</span>');
  });
});
