import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Divider } from './divider';

describe('Divider', () => {
  it('default: gorizontal separator, 1px border rangida', () => {
    render(<Divider />);
    const sep = screen.getByRole('separator');
    expect(sep).toHaveAttribute('aria-orientation', 'horizontal');
    expect(sep).toHaveAttribute('data-orientation', 'horizontal');
    expect(sep).toHaveClass('h-px', 'w-full', 'bg-border');
  });

  it('vertikal', () => {
    render(<Divider orientation="vertical" />);
    const sep = screen.getByRole('separator');
    expect(sep).toHaveAttribute('aria-orientation', 'vertical');
    expect(sep).toHaveClass('w-px', 'self-stretch');
  });

  it('label — o‘rtada matn, accessible nom', () => {
    render(<Divider label="yoki" />);
    const sep = screen.getByRole('separator', { name: 'yoki' });
    expect(sep).toHaveTextContent('yoki');
    expect(sep).toHaveClass('text-text-muted', 'text-xs', 'before:bg-border', 'after:bg-border');
  });

  it('vertikal label', () => {
    render(<Divider orientation="vertical" label="yoki" />);
    expect(screen.getByRole('separator', { name: 'yoki' })).toHaveClass('flex-col');
  });

  it('decorative — role="none"', () => {
    const { container } = render(<Divider decorative />);
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute('role', 'none');
  });

  it('className, ref va qolgan atributlar', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Divider ref={ref} id="d1" className="my-6 bg-border-strong" />);
    const sep = screen.getByRole('separator');
    expect(ref.current).toBe(sep);
    expect(sep).toHaveAttribute('id', 'd1');
    expect(sep).toHaveClass('my-6', 'bg-border-strong');
    expect(sep).not.toHaveClass('bg-border');
  });
});
