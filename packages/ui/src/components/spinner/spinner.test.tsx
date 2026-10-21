import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Spinner } from './spinner';

describe('Spinner', () => {
  it('role="status" va default yashirin matn', () => {
    render(<Spinner />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Yuklanmoqda');
    expect(screen.getByText('Yuklanmoqda')).toHaveClass('sr-only');
  });

  it("label o'zgartiriladi", () => {
    render(<Spinner label="Saqlanmoqda" />);
    expect(screen.getByRole('status')).toHaveTextContent('Saqlanmoqda');
  });

  it.each([
    ['sm', 'size-4'],
    ['md', 'size-5'],
    ['lg', 'size-6'],
  ] as const)('size=%s → %s', (size, cls) => {
    render(<Spinner size={size} />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('data-size', size);
    expect(status.querySelector('[aria-hidden="true"]')).toHaveClass(cls, 'animate-spinner');
  });

  it('default size md, currentColor ishlatadi', () => {
    render(<Spinner />);
    const ring = screen.getByRole('status').querySelector('[aria-hidden="true"]');
    expect(ring).toHaveClass('size-5', 'border-current');
  });

  it('className, ref va qolgan props ildizga', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} className="text-primary" data-testid="sp" id="x" />);
    const el = screen.getByTestId('sp');
    expect(ref.current).toBe(el);
    expect(el).toHaveClass('text-primary');
    expect(el).toHaveAttribute('id', 'x');
  });
});
