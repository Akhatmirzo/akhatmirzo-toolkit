import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDocumentVisibility } from './use-document-visibility';

let state: DocumentVisibilityState = 'visible';
vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => state);

function setVisibility(next: DocumentVisibilityState) {
  state = next;
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

afterEach(() => {
  state = 'visible';
});

describe('useDocumentVisibility', () => {
  it('holat o‘zgarishini kuzatadi', () => {
    const { result } = renderHook(() => useDocumentVisibility());
    expect(result.current).toBe('visible');
    setVisibility('hidden');
    expect(result.current).toBe('hidden');
    setVisibility('visible');
    expect(result.current).toBe('visible');
  });

  it('unmount’da tinglovchi olib tashlanadi', () => {
    const remove = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useDocumentVisibility());
    unmount();
    expect(remove).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    remove.mockRestore();
  });

  it('SSR: serverda doim visible', () => {
    state = 'hidden';
    function Demo() {
      return <p>{useDocumentVisibility()}</p>;
    }
    expect(renderToString(<Demo />)).toContain('visible');
  });
});
