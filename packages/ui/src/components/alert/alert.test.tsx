import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Alert } from './alert';

describe('Alert', () => {
  it('default: info soft, role="status", ichki ikonka', () => {
    render(<Alert title="Yangilanish">Tizim yangilandi.</Alert>);
    const alert = screen.getByRole('status');
    expect(alert).toHaveAttribute('data-color', 'info');
    expect(alert).toHaveAttribute('data-variant', 'soft');
    expect(alert).toHaveClass(
      'rounded-lg',
      'px-4',
      'py-3',
      'bg-info-soft',
      'text-info-soft-foreground',
    );
    expect(alert).toHaveTextContent('Yangilanish');
    expect(alert).toHaveTextContent('Tizim yangilandi.');
    const icon = alert.querySelector('[data-alert-icon] svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it.each([
    ['danger', 'alert'],
    ['warning', 'alert'],
    ['success', 'status'],
    ['info', 'status'],
    ['neutral', 'status'],
    ['primary', 'status'],
  ] as const)('color=%s → role="%s"', (color, role) => {
    render(<Alert color={color} title="Xabar" />);
    expect(screen.getByRole(role)).toHaveAttribute('data-color', color);
  });

  it.each([
    ['soft', 'success', ['bg-success-soft', 'text-success-soft-foreground']],
    ['soft', 'neutral', ['bg-surface-muted', 'text-text']],
    ['outline', 'danger', ['border-danger', 'bg-surface', 'text-text']],
    ['solid', 'warning', ['bg-warning', 'text-warning-foreground']],
    ['solid', 'primary', ['bg-primary', 'text-primary-foreground']],
  ] as const)('%s + %s ranglari tokenlardan', (variant, color, classes) => {
    render(<Alert variant={variant} color={color} title="Xabar" data-testid="a" />);
    const alert = screen.getByTestId('a');
    expect(alert).toHaveClass(...classes);
    expect(alert).toHaveAttribute('data-variant', variant);
  });

  it('outline variantda ikonka rangli', () => {
    render(<Alert variant="outline" color="success" title="Saqlandi" />);
    expect(screen.getByRole('status').querySelector('[data-alert-icon]')).toHaveClass(
      'text-success-soft-foreground',
    );
  });

  it('icon={false} — ikonkasiz, maxsus ikonka ham beriladi', () => {
    const { rerender } = render(<Alert icon={false} title="Ikonkasiz" />);
    expect(screen.getByRole('status').querySelector('[data-alert-icon]')).toBeNull();
    rerender(<Alert icon={<span data-testid="my-icon" />} title="Maxsus" />);
    expect(screen.getByTestId('my-icon')).toBeInTheDocument();
  });

  it('action render qilinadi', () => {
    render(
      <Alert
        color="danger"
        title="To'lov o'tmadi"
        action={<button type="button">Qayta urinish</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Qayta urinish' })).toBeInTheDocument();
  });

  it('onClose — ✕ tugmasi sichqoncha va klaviatura bilan ishlaydi', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Alert title="Xabar" onClose={onClose} />);
    const btn = screen.getByRole('button', { name: 'Yopish' });
    expect(btn).toHaveAttribute('type', 'button');

    await user.click(btn);
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.tab({ shift: true });
    await user.tab();
    expect(btn).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('labels.close bilan ✕ yorlig‘i o‘zgaradi; onClose yo‘q bo‘lsa tugma yo‘q', () => {
    const { rerender } = render(
      <Alert title="Xabar" onClose={() => {}} labels={{ close: 'Xabarni yopish' }} />,
    );
    expect(screen.getByRole('button', { name: 'Xabarni yopish' })).toBeInTheDocument();
    rerender(<Alert title="Xabar" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('banner — radius 0, faqat pastki chegara', () => {
    render(<Alert banner title="Texnik ishlar" />);
    const alert = screen.getByRole('status');
    expect(alert).toHaveAttribute('data-banner');
    expect(alert).toHaveClass('rounded-none', 'border-x-0', 'border-t-0', 'justify-center');
    expect(alert).not.toHaveClass('rounded-lg');
  });

  it('className, ref va qolgan atributlar ildizga; role almashtirilishi mumkin', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Alert ref={ref} className="px-6" id="a1" role="note" title="Eslatma" data-testid="a" />,
    );
    const alert = screen.getByTestId('a');
    expect(ref.current).toBe(alert);
    expect(alert).toHaveAttribute('id', 'a1');
    expect(alert).toHaveAttribute('role', 'note');
    expect(alert).toHaveClass('px-6');
    expect(alert).not.toHaveClass('px-4');
  });
});
