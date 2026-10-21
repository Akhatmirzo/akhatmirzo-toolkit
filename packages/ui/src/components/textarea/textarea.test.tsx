import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Textarea } from './textarea';

describe('Textarea', () => {
  afterEach(() => vi.restoreAllMocks());

  it('render: default minRows=3, props textarea ga, className konteynerga', () => {
    render(<Textarea aria-label="Izoh" className="max-w-md" placeholder="Yozing" />);
    const el = screen.getByRole('textbox', { name: 'Izoh' });
    expect(el.tagName).toBe('TEXTAREA');
    expect(el).toHaveAttribute('rows', '3');
    expect(el).toHaveAttribute('placeholder', 'Yozing');
    expect(el).toHaveClass('outline-none', 'resize-y');
    expect(el.parentElement).toHaveClass('max-w-md', 'focus-ring-within');
    expect(el.parentElement).toHaveAttribute('data-size', 'md');
  });

  it('ref textarea elementiga', () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<Textarea ref={ref} aria-label="x" />);
    expect(ref.current).toBe(screen.getByRole('textbox'));
  });

  it('invalid, disabled, readOnly holatlari', () => {
    const { rerender } = render(<Textarea aria-label="x" invalid />);
    const el = () => screen.getByRole('textbox');
    expect(el()).toHaveAttribute('aria-invalid', 'true');
    expect(el().parentElement).toHaveAttribute('data-invalid');
    rerender(<Textarea aria-label="x" disabled />);
    expect(el()).toBeDisabled();
    expect(el().parentElement).toHaveAttribute('data-disabled');
    rerender(<Textarea aria-label="x" readOnly />);
    expect(el()).toHaveAttribute('readonly');
    expect(el().parentElement).toHaveAttribute('data-readonly');
  });

  it('showCount + maxLength: "n / max" yozilganda yangilanadi', async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="x" showCount maxLength={10} defaultValue="abc" />);
    expect(screen.getByText('3 / 10')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox'), 'de');
    expect(screen.getByText('5 / 10')).toBeInTheDocument();
  });

  it('showCount hisoblagichi aria-describedby ga ulanadi', () => {
    render(<Textarea aria-label="x" aria-describedby="tashqi" showCount maxLength={10} />);
    const el = screen.getByRole('textbox');
    const ids = el.getAttribute('aria-describedby')?.split(' ') ?? [];
    expect(ids).toContain('tashqi');
    expect(ids).toContain(screen.getByText('0 / 10').id);
  });

  it('showCount controlled qiymat bilan, maxLength siz', () => {
    render(<Textarea aria-label="x" showCount value="salom" onChange={() => {}} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('autoResize: balandlik minRows..maxRows oralig`ida', async () => {
    let scroll = 0;
    vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockImplementation(() => scroll);
    const user = userEvent.setup();
    render(
      <Textarea
        aria-label="x"
        autoResize
        minRows={2}
        maxRows={4}
        style={{ lineHeight: '20px', paddingTop: '0px', paddingBottom: '0px' }}
      />,
    );
    const el = screen.getByRole('textbox');
    expect(el).toHaveClass('resize-none');
    expect(el.style.height).toBe('40px');

    scroll = 60;
    await user.type(el, 'a');
    expect(el.style.height).toBe('60px');
    expect(el.style.overflowY).toBe('hidden');

    scroll = 200;
    await user.type(el, 'b');
    expect(el.style.height).toBe('80px');
    expect(el.style.overflowY).toBe('auto');
  });
});
