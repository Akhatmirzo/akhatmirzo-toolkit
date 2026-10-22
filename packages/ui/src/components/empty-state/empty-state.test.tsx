import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('title — standart h3, description va harakatlar', () => {
    render(
      <EmptyState
        title="Buyurtmalar hali yo'q"
        description="Birinchi buyurtma kelganda shu yerda ko'rinadi."
        action={<button type="button">Mahsulot qo'shish</button>}
        secondaryAction={<button type="button">Qo'llanma</button>}
      />,
    );
    expect(screen.getByRole('heading', { level: 3, name: "Buyurtmalar hali yo'q" })).toHaveClass(
      'text-base',
      'font-semibold',
    );
    expect(screen.getByText("Birinchi buyurtma kelganda shu yerda ko'rinadi.")).toHaveClass(
      'text-sm',
      'text-text-muted',
      'max-w-[40ch]',
    );
    expect(screen.getByRole('button', { name: "Mahsulot qo'shish" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "Qo'llanma" })).toBeInTheDocument();
  });

  it('headingLevel tegni o‘zgartiradi', () => {
    render(<EmptyState title="Natija yo'q" headingLevel={2} />);
    expect(screen.getByRole('heading', { level: 2, name: "Natija yo'q" })).toBeInTheDocument();
  });

  it('icon doira ichida, ekran o‘quvchidan yashirin', () => {
    const { container } = render(<EmptyState icon={<svg />} title="Bo'sh" />);
    const icon = container.querySelector('[data-empty-state-icon]');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveClass('size-12', 'rounded-full', 'bg-surface-muted', 'text-text-muted');
  });

  it('icon yo‘q bo‘lsa doira ham yo‘q; harakatsiz — tugmalar bloki yo‘q', () => {
    const { container } = render(<EmptyState title="Bo'sh" />);
    expect(container.querySelector('[data-empty-state-icon]')).toBeNull();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it.each([
    ['sm', 'py-6'],
    ['md', 'py-10'],
    ['lg', 'py-16'],
  ] as const)('size=%s → %s', (size, cls) => {
    render(<EmptyState size={size} title="Bo'sh" data-testid="es" />);
    const root = screen.getByTestId('es');
    expect(root).toHaveAttribute('data-size', size);
    expect(root).toHaveClass(cls);
  });

  it('lg — katta ikonka va sarlavha', () => {
    const { container } = render(<EmptyState size="lg" icon={<svg />} title="Xush kelibsiz" />);
    expect(container.querySelector('[data-empty-state-icon]')).toHaveClass('size-16');
    expect(screen.getByRole('heading')).toHaveClass('text-lg');
  });

  it('bordered — punktir chegara', () => {
    render(<EmptyState bordered title="Bo'sh" data-testid="es" />);
    const root = screen.getByTestId('es');
    expect(root).toHaveAttribute('data-bordered');
    expect(root).toHaveClass('border-dashed', 'border-border', 'rounded-xl');
  });

  it('className, ref va qolgan atributlar ildizga', () => {
    const ref = createRef<HTMLDivElement>();
    render(<EmptyState ref={ref} title="Bo'sh" className="py-2" id="e1" data-testid="es" />);
    const root = screen.getByTestId('es');
    expect(ref.current).toBe(root);
    expect(root).toHaveAttribute('id', 'e1');
    expect(root).toHaveClass('py-2');
    expect(root).not.toHaveClass('py-10');
  });
});
