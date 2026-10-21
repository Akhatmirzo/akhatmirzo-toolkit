import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button, buttonVariants } from './button';

describe('Button', () => {
  it('default: soft, md, type="button"', () => {
    render(<Button>Saqlash</Button>);
    const btn = screen.getByRole('button', { name: 'Saqlash' });
    expect(btn).toHaveAttribute('data-variant', 'soft');
    expect(btn).toHaveAttribute('data-size', 'md');
    expect(btn).toHaveAttribute('type', 'button');
    expect(btn).toHaveClass('bg-primary-soft', 'h-10', 'px-4', 'focus-ring', 'font-sans');
  });

  it.each([
    ['primary', 'bg-primary'],
    ['soft', 'bg-primary-soft'],
    ['outline', 'border-border'],
    ['ghost', 'bg-transparent'],
    ['danger', 'bg-danger'],
    ['link', 'text-link'],
  ] as const)('variant=%s', (variant, cls) => {
    render(<Button variant={variant}>Tugma</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('data-variant', variant);
    expect(btn).toHaveClass(cls);
  });

  it('link varianti: padding va balandliksiz', () => {
    render(<Button variant="link">Shartlar</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('h-auto', 'px-0');
    expect(btn).not.toHaveClass('h-10', 'px-4', 'not-data-disabled:active:scale-[0.97]');
  });

  it.each([
    ['sm', 'h-8'],
    ['md', 'h-10'],
    ['lg', 'h-12'],
  ] as const)('size=%s → %s', (size, cls) => {
    render(<Button size={size}>Tugma</Button>);
    expect(screen.getByRole('button')).toHaveClass(cls);
  });

  it('type="submit" ni o‘zgartirish mumkin', () => {
    render(<Button type="submit">Yuborish</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('sichqoncha, Enter va Space bilan bosiladi', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Bosing</Button>);
    await user.click(screen.getByRole('button'));
    await user.tab();
    await user.tab({ shift: true });
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('disabled: bosilmaydi, data-disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        O‘chiq
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('data-disabled');
    expect(btn).toHaveClass('data-disabled:opacity-50');
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('loading: aria-busy, spinner, matn joyida, bosish o‘chadi', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Saqlanmoqda
      </Button>,
    );
    const btn = screen.getByRole('button', { name: /^Saqlanmoqda\s?Yuklanmoqda$/ });
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    expect(btn).toHaveAttribute('data-loading');
    expect(btn).not.toBeDisabled();
    expect(screen.getByText('Saqlanmoqda')).toHaveClass('opacity-0');
    expect(btn.querySelector('[role="status"]')).toHaveAttribute('aria-hidden', 'true');

    btn.focus();
    await user.keyboard('{Enter}');
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('loading: live region e‘lon qiladi, labels.loading o‘zgartiriladi', () => {
    const { rerender } = render(<Button>Saqlash</Button>);
    const live = screen.getByRole('button').querySelector('[aria-live="polite"]');
    expect(live).toHaveClass('sr-only');
    expect(live).toBeEmptyDOMElement();
    rerender(<Button loading>Saqlash</Button>);
    expect(live).toHaveTextContent('Yuklanmoqda');
    rerender(
      <Button loading labels={{ loading: 'Saqlanmoqda' }}>
        Saqlash
      </Button>,
    );
    expect(live).toHaveTextContent('Saqlanmoqda');
  });

  it('leftIcon va rightIcon aria-hidden o‘ramada', () => {
    render(
      <Button leftIcon={<svg data-testid="l" />} rightIcon={<svg data-testid="r" />}>
        Qo‘shish
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Qo‘shish' });
    const [first, , last] = Array.from(btn.children);
    expect(first).toContainElement(screen.getByTestId('l'));
    expect(last).toContainElement(screen.getByTestId('r'));
    expect(first).toHaveAttribute('aria-hidden', 'true');
  });

  it('fullWidth', () => {
    render(<Button fullWidth>Kirish</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('className ustun turadi, ref va qolgan props', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} className="rounded-full px-8" aria-label="Maxsus" data-foo="1">
        X
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Maxsus' });
    expect(ref.current).toBe(btn);
    expect(btn).toHaveClass('rounded-full', 'px-8');
    expect(btn).not.toHaveClass('rounded-lg', 'px-4');
    expect(btn).toHaveAttribute('data-foo', '1');
  });

  it('asChild: <a> render qilinadi, stil Button niki', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button asChild variant="link" leftIcon={<svg data-testid="l" />} onClick={onClick}>
        <a href="#shartlar">Shartlar</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Shartlar' });
    expect(link).toHaveAttribute('href', '#shartlar');
    expect(link).toHaveAttribute('data-variant', 'link');
    expect(link).toHaveClass('text-link');
    expect(link).toContainElement(screen.getByTestId('l'));
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    await user.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('asChild + disabled: aria-disabled, fokusdan chiqadi, bosilmaydi', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button asChild disabled onClick={onClick}>
        <a href="#x">Havola</a>
      </Button>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('data-disabled');
    expect(link).toHaveAttribute('tabindex', '-1');
    await user.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('buttonVariants eksport qilinadi', () => {
    expect(buttonVariants({ variant: 'primary', size: 'lg' })).toContain('bg-primary');
    expect(buttonVariants()).toContain('bg-primary-soft');
  });
});
