import { cleanup, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useScrollLock } from './use-scroll-lock';

const root = document.documentElement;

beforeEach(() => {
  // jsdom'da layout yo'q: 15px scrollbar'ni taqlid qilamiz
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
  Object.defineProperty(root, 'clientWidth', { configurable: true, value: 1009 });
  document.body.style.paddingRight = '4px';
  document.body.style.overflow = 'auto';
});

afterEach(() => {
  cleanup();
  document.body.removeAttribute('style');
});

describe('useScrollLock', () => {
  it('qulflaydi, scrollbar kengligini padding bilan qoplaydi va tiklaydi', () => {
    const { rerender } = renderHook(({ locked }) => useScrollLock(locked), {
      initialProps: { locked: true },
    });
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.paddingRight).toBe('19px');
    expect(document.body.style.overscrollBehavior).toBe('none');
    rerender({ locked: false });
    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.paddingRight).toBe('4px');
    expect(document.body.style.overscrollBehavior).toBe('');
  });

  it('hisoblagich: oxirgi qulf ochilganda tiklanadi', () => {
    const a = renderHook(() => useScrollLock(true));
    const b = renderHook(() => useScrollLock(true));
    expect(document.body.style.paddingRight).toBe('19px');
    a.unmount();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.paddingRight).toBe('19px');
    b.unmount();
    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.paddingRight).toBe('4px');
  });

  it('target elementni qulflaydi', () => {
    const el = document.createElement('div');
    document.body.append(el);
    const { unmount } = renderHook(() => useScrollLock(true, { target: el }));
    expect(el.style.overflow).toBe('hidden');
    expect(document.body.style.overflow).toBe('auto');
    unmount();
    expect(el.style.overflow).toBe('');
    el.remove();
  });

  it('locked=false — hech narsa qilmaydi', () => {
    renderHook(() => useScrollLock(false));
    expect(document.body.style.overflow).toBe('auto');
  });

  it('StrictMode: mount/unmount/mount qulfni ikki marta qo‘ymaydi', () => {
    const { rerender, unmount } = renderHook(({ locked }) => useScrollLock(locked), {
      initialProps: { locked: true },
      wrapper: StrictMode,
    });
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.paddingRight).toBe('19px');
    rerender({ locked: false });
    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.paddingRight).toBe('4px');
    rerender({ locked: true });
    unmount();
    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.paddingRight).toBe('4px');
  });

  it('body’da allaqachon overflow: hidden bo‘lsa — tiklanganda saqlanadi', () => {
    document.body.style.overflow = 'hidden';
    // Scrollbar yo'q — padding qo'shilmaydi
    Object.defineProperty(root, 'clientWidth', { configurable: true, value: 1024 });
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.paddingRight).toBe('4px');
    unmount();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.paddingRight).toBe('4px');
  });

  it('SSR: renderToString xato bermaydi', () => {
    function Demo() {
      useScrollLock(true);
      return <p>ok</p>;
    }
    expect(renderToString(<Demo />)).toContain('ok');
    expect(document.body.style.overflow).toBe('auto');
  });
});
