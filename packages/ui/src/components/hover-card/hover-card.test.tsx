import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HoverCard } from './hover-card';

function Profile(props: { size?: 'sm' | 'md'; openDelay?: number; closeDelay?: number }) {
  const { size, ...root } = props;
  return (
    <HoverCard {...root}>
      <HoverCard.Trigger asChild>
        <a href="/u/akhatmirzo">@akhatmirzo</a>
      </HoverCard.Trigger>
      <HoverCard.Content size={size} data-testid="card">
        Akhatmirzo — frontend dasturchi
      </HoverCard.Content>
    </HoverCard>
  );
}

describe('HoverCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const advance = (ms: number) =>
    act(() => {
      vi.advanceTimersByTime(ms);
    });

  it('kursor kelganda 500ms dan keyin ochiladi, ketganda 200ms dan keyin yopiladi', () => {
    render(<Profile />);
    const link = screen.getByRole('link', { name: '@akhatmirzo' });
    fireEvent.pointerEnter(link, { pointerType: 'mouse' });
    advance(400);
    expect(screen.queryByTestId('card')).not.toBeInTheDocument();
    advance(150);
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('data-state', 'open');
    expect(link).toHaveAttribute('data-state', 'open');

    fireEvent.pointerLeave(link, { pointerType: 'mouse' });
    advance(100);
    expect(screen.getByTestId('card')).toBeInTheDocument();
    advance(150);
    expect(screen.queryByTestId('card')).not.toBeInTheDocument();
  });

  it('klaviatura fokusida ochiladi, blur’da yopiladi', () => {
    render(<Profile openDelay={100} closeDelay={50} />);
    const link = screen.getByRole('link', { name: '@akhatmirzo' });
    act(() => link.focus());
    advance(150);
    expect(screen.getByTestId('card')).toBeInTheDocument();
    act(() => link.blur());
    advance(100);
    expect(screen.queryByTestId('card')).not.toBeInTheDocument();
  });

  it('sensorli kiritishda ochilmaydi', () => {
    render(<Profile />);
    const link = screen.getByRole('link', { name: '@akhatmirzo' });
    fireEvent.pointerEnter(link, { pointerType: 'touch' });
    advance(1000);
    expect(screen.queryByTestId('card')).not.toBeInTheDocument();
  });

  it('o‘lcham: md (default) — w-80, sm — w-60; data-size', () => {
    const { unmount } = render(
      <HoverCard open>
        <HoverCard.Trigger>t</HoverCard.Trigger>
        <HoverCard.Content data-testid="card">k</HoverCard.Content>
      </HoverCard>,
    );
    expect(screen.getByTestId('card')).toHaveClass('w-80');
    expect(screen.getByTestId('card')).toHaveAttribute('data-size', 'md');
    unmount();
    render(
      <HoverCard open>
        <HoverCard.Trigger>t</HoverCard.Trigger>
        <HoverCard.Content size="sm" data-testid="card">
          k
        </HoverCard.Content>
      </HoverCard>,
    );
    expect(screen.getByTestId('card')).toHaveClass('w-60');
  });

  it('Popover bilan bir xil panel, ref va className', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <HoverCard open>
        <HoverCard.Trigger>t</HoverCard.Trigger>
        <HoverCard.Content ref={ref} className="custom">
          k
        </HoverCard.Content>
      </HoverCard>,
    );
    expect(ref.current).toHaveClass('custom', 'bg-surface-raised', 'rounded-xl', 'shadow-lg');
    expect(ref.current).toHaveAttribute('data-side', 'bottom');
  });
});
