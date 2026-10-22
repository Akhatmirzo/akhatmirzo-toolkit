import { renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { useIsClient } from './use-is-client';

describe('useIsClient', () => {
  it('brauzerda true', () => {
    const { result } = renderHook(() => useIsClient());
    expect(result.current).toBe(true);
  });

  it('SSR: serverda false', () => {
    function Demo() {
      return <p>{useIsClient() ? 'client' : 'server'}</p>;
    }
    expect(renderToString(<Demo />)).toContain('server');
  });
});
