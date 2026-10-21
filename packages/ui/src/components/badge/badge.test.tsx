import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('default: neutral soft md', () => {
    render(<Badge>Yangi</Badge>);
    const badge = screen.getByText('Yangi').parentElement!;
    expect(badge).toHaveAttribute('data-variant', 'soft');
    expect(badge).toHaveAttribute('data-color', 'neutral');
    expect(badge).toHaveAttribute('data-size', 'md');
    expect(badge).toHaveClass(
      'rounded-full',
      'text-xs',
      'font-medium',
      'bg-surface-muted',
      'text-text',
    );
  });

  it.each([
    ['soft', 'primary', 'bg-primary-soft', 'text-primary-soft-foreground'],
    ['soft', 'success', 'bg-success-soft', 'text-success-soft-foreground'],
    ['solid', 'danger', 'bg-danger', 'text-danger-foreground'],
    ['solid', 'warning', 'bg-warning', 'text-warning-foreground'],
    ['outline', 'info', 'border-border', 'text-info-soft-foreground'],
  ] as const)('%s + %s ranglari tokenlardan', (variant, color, bg, text) => {
    render(
      <Badge variant={variant} color={color}>
        Holat
      </Badge>,
    );
    const badge = screen.getByText('Holat').parentElement!;
    expect(badge).toHaveClass(bg, text);
    expect(badge).toHaveAttribute('data-color', color);
  });

  it('size sm', () => {
    render(<Badge size="sm">Kichik</Badge>);
    expect(screen.getByText('Kichik').parentElement).toHaveAttribute('data-size', 'sm');
  });

  it('dot — rangli nuqta, ekran o‘quvchidan yashirin', () => {
    const { container } = render(
      <Badge dot color="success">
        Faol
      </Badge>,
    );
    const dot = container.querySelector('[data-badge-dot]');
    expect(dot).toHaveClass('bg-success');
    expect(dot).toHaveAttribute('aria-hidden', 'true');
  });

  it('solid variantda nuqta currentColor', () => {
    const { container } = render(
      <Badge dot variant="solid" color="primary">
        Faol
      </Badge>,
    );
    expect(container.querySelector('[data-badge-dot]')).toHaveClass('bg-current');
  });

  it('onRemove — ✕ tugmasi sichqoncha va klaviatura bilan ishlaydi', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<Badge onRemove={onRemove}>React</Badge>);
    const btn = screen.getByRole('button', { name: 'Olib tashlash' });
    expect(btn).toHaveAttribute('type', 'button');

    await user.click(btn);
    expect(onRemove).toHaveBeenCalledTimes(1);

    await user.tab();
    await user.tab({ shift: true });
    expect(btn).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onRemove).toHaveBeenCalledTimes(3);
  });

  it('✕ yorlig‘ini labels bilan o‘zgartirish mumkin', () => {
    render(
      <Badge onRemove={() => {}} labels={{ remove: 'React tegini olib tashlash' }}>
        React
      </Badge>,
    );
    expect(screen.getByRole('button', { name: 'React tegini olib tashlash' })).toBeInTheDocument();
  });

  it('onRemove yo‘q bo‘lsa tugma yo‘q', () => {
    render(<Badge>Oddiy</Badge>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('className, ref va qolgan atributlar ildizga', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Badge ref={ref} className="px-4" id="b1" data-testid="badge" aria-label="Status">
        X
      </Badge>,
    );
    const badge = screen.getByTestId('badge');
    expect(ref.current).toBe(badge);
    expect(badge).toHaveAttribute('id', 'b1');
    expect(badge).toHaveAttribute('aria-label', 'Status');
    expect(badge).toHaveClass('px-4');
    expect(badge).not.toHaveClass('px-2.5');
  });
});
