import { cleanup, fireEvent, render, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { matchHotkey, useHotkeys } from './use-hotkeys';

function setPlatform(platform: string) {
  Object.defineProperty(navigator, 'platform', { configurable: true, value: platform });
}

afterEach(() => {
  cleanup();
  setPlatform('Win32');
});

const key = (init: KeyboardEventInit) => new KeyboardEvent('keydown', init);

describe('matchHotkey', () => {
  it('mod: Windows’da Ctrl, macOS’da Meta', () => {
    setPlatform('Win32');
    expect(matchHotkey(key({ key: 'k', ctrlKey: true }), 'mod+k')).toBe(true);
    expect(matchHotkey(key({ key: 'k', metaKey: true }), 'mod+k')).toBe(false);
    setPlatform('MacIntel');
    expect(matchHotkey(key({ key: 'k', metaKey: true }), 'mod+k')).toBe(true);
    expect(matchHotkey(key({ key: 'k', ctrlKey: true }), 'mod+k')).toBe(false);
  });

  it('modifikatorlar aniq mos kelishi kerak', () => {
    expect(matchHotkey(key({ key: 'k', ctrlKey: true, shiftKey: true }), 'ctrl+k')).toBe(false);
    expect(matchHotkey(key({ key: 'K', ctrlKey: true, shiftKey: true }), 'ctrl+shift+k')).toBe(
      true,
    );
    expect(matchHotkey(key({ key: 'k' }), 'ctrl+k')).toBe(false);
  });

  it('shift+? va shift ko‘rsatilmagan belgi', () => {
    expect(matchHotkey(key({ key: '?', shiftKey: true }), 'shift+?')).toBe(true);
    expect(matchHotkey(key({ key: '?', shiftKey: true }), '?')).toBe(true);
    expect(matchHotkey(key({ key: '/' }), 'shift+/')).toBe(false);
  });

  it('taxalluslar: esc, enter, space, strelkalar', () => {
    expect(matchHotkey(key({ key: 'Escape' }), 'esc')).toBe(true);
    expect(matchHotkey(key({ key: 'Enter' }), 'return')).toBe(true);
    expect(matchHotkey(key({ key: ' ' }), 'space')).toBe(true);
    expect(matchHotkey(key({ key: 'ArrowDown' }), 'down')).toBe(true);
  });

  it('vergul bilan bir nechta kombinatsiya, "mod+," va "mod++"', () => {
    expect(matchHotkey(key({ key: '/' }), 'mod+k, /')).toBe(true);
    expect(matchHotkey(key({ key: ',', ctrlKey: true }), 'mod+,')).toBe(true);
    expect(matchHotkey(key({ key: '+', ctrlKey: true }), 'mod++')).toBe(true);
  });

  it('macOS’da Alt harfni o‘zgartirsa code bo‘yicha mos keladi', () => {
    expect(matchHotkey(key({ key: '˚', code: 'KeyK', altKey: true }), 'alt+k')).toBe(true);
  });

  it('kirill tartibida ham fizik tugma bo‘yicha ishlaydi', () => {
    expect(matchHotkey(key({ key: 'л', code: 'KeyK', ctrlKey: true }), 'mod+k')).toBe(true);
  });

  it('bo‘sh yoki noto‘g‘ri satr hech narsaga mos kelmaydi', () => {
    expect(matchHotkey(key({ key: 'k' }), '')).toBe(false);
    expect(matchHotkey(key({ key: 'k' }), 'hyper+k')).toBe(false);
  });
});

describe('useHotkeys', () => {
  it('handler chaqiriladi va preventDefault qilinadi', () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys('mod+k', handler));
    const ev = key({ key: 'k', ctrlKey: true, cancelable: true });
    window.dispatchEvent(ev);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(ev.defaultPrevented).toBe(true);
  });

  it('preventDefault=false', () => {
    renderHook(() => useHotkeys('esc', () => {}, { preventDefault: false }));
    const ev = key({ key: 'Escape', cancelable: true });
    window.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
  });

  it('inputlarda standart holatda ishlamaydi, enableOnInputs bilan ishlaydi', () => {
    const off = vi.fn();
    const on = vi.fn();
    renderHook(() => useHotkeys('esc', off));
    renderHook(() => useHotkeys('esc', on, { enableOnInputs: true }));
    const { getByRole } = render(<input />);
    fireEvent.keyDown(getByRole('textbox'), { key: 'Escape' });
    expect(off).not.toHaveBeenCalled();
    expect(on).toHaveBeenCalledTimes(1);
  });

  it('enabled=false va unmount', () => {
    const handler = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ enabled }) => useHotkeys('a', handler, { enabled }),
      {
        initialProps: { enabled: false },
      },
    );
    window.dispatchEvent(key({ key: 'a' }));
    expect(handler).not.toHaveBeenCalled();
    rerender({ enabled: true });
    window.dispatchEvent(key({ key: 'a' }));
    expect(handler).toHaveBeenCalledTimes(1);
    unmount();
    window.dispatchEvent(key({ key: 'a' }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('eng so‘nggi handler ishlatiladi', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ h }) => useHotkeys('x', h), { initialProps: { h: first } });
    rerender({ h: second });
    window.dispatchEvent(key({ key: 'x' }));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
