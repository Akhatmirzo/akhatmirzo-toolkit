import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Card, CardHeader } from './card';

describe('Card', () => {
  it('default: elevated, padding md', () => {
    render(<Card data-testid="card">Mazmun</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('data-variant', 'elevated');
    expect(card).toHaveAttribute('data-padding', 'md');
    expect(card).not.toHaveAttribute('data-interactive');
    expect(card).toHaveClass(
      'bg-surface',
      'border-border',
      'shadow-sm',
      'p-6',
      'rounded-xl',
      'text-text',
      'font-sans',
    );
  });

  it.each([
    ['outline', 'bg-surface'],
    ['soft', 'bg-surface-muted'],
  ] as const)('variant %s', (variant, cls) => {
    render(
      <Card data-testid="card" variant={variant}>
        X
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass(cls);
    expect(card).not.toHaveClass('shadow-sm');
  });

  it.each([
    ['none', 'p-0'],
    ['sm', 'p-4'],
    ['md', 'p-6'],
    ['lg', 'p-8'],
  ] as const)('padding %s → %s', (padding, cls) => {
    render(
      <Card data-testid="card" padding={padding}>
        X
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveClass(cls);
  });

  it('interactive — hover soyasi va pointer, onClick ishlaydi', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Card data-testid="card" interactive onClick={onClick}>
        X
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('data-interactive');
    expect(card).toHaveClass('cursor-pointer', 'hover:shadow-md', 'focus-ring');
    await user.click(card);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('asChild — havola sifatida, klaviatura bilan fokuslanadi', async () => {
    const user = userEvent.setup();
    render(
      <Card asChild interactive>
        <a href="/buyurtma/1042">Buyurtma</a>
      </Card>,
    );
    const link = screen.getByRole('link', { name: 'Buyurtma' });
    expect(link).toHaveClass('rounded-xl', 'cursor-pointer');
    await user.tab();
    expect(link).toHaveFocus();
  });

  it('kompozitsiya: Header (title, description, action), Body, Footer', () => {
    render(
      <Card>
        <Card.Header
          title="Buyurtma #1042"
          description="Bugun, 14:20"
          action={<button type="button">Menyu</button>}
        />
        <Card.Body>Tarkib</Card.Body>
        <Card.Footer>
          <button type="button">Saqlash</button>
        </Card.Footer>
      </Card>,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Buyurtma #1042' })).toBeInTheDocument();
    expect(screen.getByText('Bugun, 14:20')).toHaveClass('text-text-muted');
    expect(screen.getByRole('button', { name: 'Menyu' })).toBeInTheDocument();
    expect(screen.getByText('Tarkib')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Saqlash' })).toBeInTheDocument();
  });

  it('Card.Header — CardHeader bilan bir xil; title bo‘lmasa sarlavha yo‘q', () => {
    expect(Card.Header).toBe(CardHeader);
    render(<Card.Header action={<span>A</span>} />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('className, ref va qolgan atributlar', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Card ref={ref} className="p-2" id="c1" aria-label="Karta">
        X
      </Card>,
    );
    const card = screen.getByLabelText('Karta');
    expect(ref.current).toBe(card);
    expect(card).toHaveAttribute('id', 'c1');
    expect(card).toHaveClass('p-2');
    expect(card).not.toHaveClass('p-6');
  });

  it('sub-komponentlar ref va className qabul qiladi', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Card.Footer ref={ref} className="justify-end">
        F
      </Card.Footer>,
    );
    expect(ref.current).toHaveClass('justify-end', 'flex');
  });
});
