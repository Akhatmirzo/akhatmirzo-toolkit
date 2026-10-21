import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { IconButton } from './icon-button';

const Icon = () => <svg data-testid="icon" />;

describe('IconButton', () => {
  it('aria-label bilan nomlanadi', () => {
    render(
      <IconButton aria-label="Yopish">
        <Icon />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Yopish' })).toBeInTheDocument();
  });

  it('aria-label TypeScript orqali majburiy', () => {
    // @ts-expect-error aria-label yo'q
    render(<IconButton>x</IconButton>);
  });

  it.each([
    ['sm', 'size-8'],
    ['md', 'size-10'],
    ['lg', 'size-12'],
  ] as const)('size=%s kvadrat → %s', (size, cls) => {
    render(
      <IconButton aria-label="Qo'shish" size={size}>
        <Icon />
      </IconButton>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass(cls, 'px-0');
    expect(btn).not.toHaveClass('h-8', 'h-10', 'h-12');
  });

  it('Button variantlari ishlaydi', () => {
    render(
      <IconButton aria-label="O'chirish" variant="danger">
        <Icon />
      </IconButton>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('data-variant', 'danger');
    expect(btn).toHaveClass('bg-danger');
  });

  it('bosish, klaviatura va disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(
      <IconButton aria-label="Yopish" onClick={onClick}>
        <Icon />
      </IconButton>,
    );
    await user.click(screen.getByRole('button'));
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(2);

    rerender(
      <IconButton aria-label="Yopish" onClick={onClick} disabled>
        <Icon />
      </IconButton>,
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('loading: spinner, aria-busy, ikonka joyida', () => {
    render(
      <IconButton aria-label="Yangilash" loading>
        <Icon />
      </IconButton>,
    );
    const btn = screen.getByRole('button', { name: 'Yangilash' });
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('ref va className', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <IconButton aria-label="Yopish" ref={ref} className="rounded-full">
        <Icon />
      </IconButton>,
    );
    expect(ref.current).toBe(screen.getByRole('button'));
    expect(ref.current).toHaveClass('rounded-full');
    expect(ref.current).not.toHaveClass('rounded-lg');
  });
});
