import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('render: default md, props input elementiga, className konteynerga', () => {
    render(<Input placeholder="Ism" className="w-60" data-testid="i" />);
    const input = screen.getByPlaceholderText('Ism');
    expect(input).toHaveAttribute('data-testid', 'i');
    expect(input).toHaveAttribute('type', 'text');
    const box = input.parentElement!;
    expect(box).toHaveAttribute('data-slot', 'input');
    expect(box).toHaveAttribute('data-size', 'md');
    expect(box).toHaveClass('w-60', 'h-10', 'focus-ring-within');
    // halqa konteynerda — input o'zida outline yo'q
    expect(input).toHaveClass('outline-none');
  });

  it.each([
    ['sm', 'h-8'],
    ['md', 'h-10'],
    ['lg', 'h-12'],
  ] as const)('size=%s → %s', (size, cls) => {
    render(<Input size={size} aria-label="x" />);
    expect(screen.getByRole('textbox').parentElement).toHaveClass(cls);
  });

  it('ref input elementiga yo`naltiriladi', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} aria-label="x" />);
    expect(ref.current).toBe(screen.getByRole('textbox'));
  });

  it('invalid: aria-invalid va data-invalid', () => {
    render(<Input invalid aria-label="x" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.parentElement).toHaveAttribute('data-invalid');
  });

  it('disabled va readOnly holatlari', () => {
    const { rerender } = render(<Input disabled aria-label="x" />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('textbox').parentElement).toHaveAttribute('data-disabled');
    rerender(<Input readOnly aria-label="x" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    expect(screen.getByRole('textbox').parentElement).toHaveAttribute('data-readonly');
  });

  it('leftIcon, rightIcon, prefix, suffix', () => {
    render(
      <Input
        aria-label="Narx"
        prefix="+998"
        suffix="so'm"
        leftIcon={<svg data-testid="l" />}
        rightIcon={<svg data-testid="r" />}
      />,
    );
    expect(screen.getByText('+998')).toHaveClass('border-r');
    expect(screen.getByText("so'm")).toHaveClass('border-l');
    expect(screen.getByTestId('l')).toBeInTheDocument();
    expect(screen.getByTestId('r')).toBeInTheDocument();
  });

  it('konteynerning bo`sh joyiga bosilsa input fokuslanadi', async () => {
    render(<Input aria-label="x" prefix="+998" />);
    await userEvent.click(screen.getByText('+998'));
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('clearable: qiymat bo`lsagina ✕ ko`rinadi, bosilsa tozalaydi', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<Input aria-label="x" clearable onClear={onClear} />);
    expect(screen.queryByRole('button', { name: 'Tozalash' })).not.toBeInTheDocument();
    await user.type(screen.getByRole('textbox'), 'salom');
    await user.click(screen.getByRole('button', { name: 'Tozalash' }));
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(onClear).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Tozalash' })).not.toBeInTheDocument();
  });

  it('clearable: Esc tozalaydi va controlled onChange ga bo`sh qiymat keladi', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    function Demo() {
      const [v, setV] = useState('matn');
      return (
        <Input
          aria-label="x"
          clearable
          onClear={onClear}
          value={v}
          onChange={(e) => setV(e.target.value)}
        />
      );
    }
    render(<Demo />);
    const input = screen.getByRole('textbox');
    input.focus();
    await user.keyboard('{Escape}');
    expect(input).toHaveValue('');
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('Esc bo`sh maydonda hodisani to`xtatmaydi', async () => {
    const onParent = vi.fn();
    render(
      <div onKeyDown={(e) => e.key === 'Escape' && onParent()}>
        <Input aria-label="x" clearable />
      </div>,
    );
    screen.getByRole('textbox').focus();
    await userEvent.keyboard('{Escape}');
    expect(onParent).toHaveBeenCalledOnce();
  });

  it('disabled yoki readOnly bo`lsa ✕ chiqmaydi', () => {
    render(
      <>
        <Input aria-label="a" clearable disabled defaultValue="x" />
        <Input aria-label="b" clearable readOnly defaultValue="x" />
      </>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('password: ko`rsatish/yashirish tugmasi', async () => {
    const user = userEvent.setup();
    render(<Input type="password" aria-label="Parol" defaultValue="maxfiy123" />);
    const input = screen.getByLabelText('Parol');
    expect(input).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: "Parolni ko'rsatish" }));
    expect(input).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: 'Parolni yashirish' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('password tugmasi klaviatura bilan ishlaydi, matnlar o`zgartiriladi', async () => {
    const user = userEvent.setup();
    render(
      <Input
        type="password"
        aria-label="Parol"
        labels={{ showPassword: 'Show', hidePassword: 'Hide' }}
      />,
    );
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Show' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByLabelText('Parol')).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument();
  });
});
