import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isApplePlatform, Kbd } from './kbd';

function mockPlatform(platform: string) {
  vi.spyOn(navigator, 'platform', 'get').mockReturnValue(platform);
}

describe('Kbd', () => {
  afterEach(() => vi.restoreAllMocks());

  it('children bilan <kbd> elementi', () => {
    render(<Kbd>Esc</Kbd>);
    const el = screen.getByText('Esc');
    expect(el.tagName).toBe('KBD');
    expect(el).toHaveClass('font-mono', 'bg-surface-muted', 'border-b-2');
  });

  it('keys massivi alohida bo‘laklarda', () => {
    render(<Kbd keys={['Shift', 'Enter']} data-testid="k" />);
    const el = screen.getByTestId('k');
    expect(el.querySelectorAll('span')).toHaveLength(2);
    expect(el).toHaveTextContent('ShiftEnter');
  });

  it('Windows/Linux da mod → Ctrl', () => {
    mockPlatform('Win32');
    render(<Kbd keys={['mod', 'K']} data-testid="k" />);
    expect(screen.getByTestId('k')).toHaveTextContent('CtrlK');
  });

  it('macOS da mod → ⌘', () => {
    mockPlatform('MacIntel');
    render(<Kbd keys={['mod', 'K']} data-testid="k" />);
    expect(screen.getByTestId('k')).toHaveTextContent('⌘K');
  });

  it('isApplePlatform iPhone ni ham taniydi', () => {
    mockPlatform('iPhone');
    expect(isApplePlatform()).toBe(true);
    mockPlatform('Linux x86_64');
    expect(isApplePlatform()).toBe(false);
  });

  it('size: default sm, md', () => {
    const { rerender } = render(<Kbd data-testid="k">K</Kbd>);
    expect(screen.getByTestId('k')).toHaveAttribute('data-size', 'sm');
    expect(screen.getByTestId('k')).toHaveClass('h-5', 'text-xs');
    rerender(
      <Kbd data-testid="k" size="md">
        K
      </Kbd>,
    );
    expect(screen.getByTestId('k')).toHaveClass('h-6', 'text-sm');
  });

  it('className va ref', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Kbd ref={ref} className="ml-auto">
        K
      </Kbd>,
    );
    expect(ref.current).toHaveClass('ml-auto');
  });
});
