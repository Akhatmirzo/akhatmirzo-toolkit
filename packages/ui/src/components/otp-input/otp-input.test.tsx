import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Field } from '../field';
import { OtpInput, ResendTimer } from './otp-input';

const cells = () => screen.getAllByRole('textbox') as HTMLInputElement[];
const values = () =>
  cells()
    .map((c) => c.value)
    .join('');

describe('OtpInput', () => {
  it('Field tashqarisida guruh nomi: default, labels.group, aria-label ustun', () => {
    const { rerender } = render(<OtpInput />);
    expect(screen.getByRole('group', { name: 'Tasdiqlash kodi' })).toBeInTheDocument();
    rerender(<OtpInput labels={{ group: 'SMS kod' }} />);
    expect(screen.getByRole('group', { name: 'SMS kod' })).toBeInTheDocument();
    rerender(<OtpInput labels={{ group: 'SMS kod' }} aria-label="Kod" />);
    expect(screen.getByRole('group', { name: 'Kod' })).toBeInTheDocument();
  });

  it('render: 6 katakcha, guruh, ARIA', () => {
    render(<OtpInput groupSize={3} aria-label="Kod" />);
    const group = screen.getByRole('group', { name: 'Kod' });
    expect(cells()).toHaveLength(6);
    expect(cells()[0]).toHaveAttribute('autocomplete', 'one-time-code');
    expect(cells()[1]).toHaveAttribute('autocomplete', 'off');
    expect(cells()[0]).toHaveAttribute('inputmode', 'numeric');
    expect(cells()[0]).toHaveAccessibleName('1-raqam');
    expect(group).toHaveTextContent('–');
    expect(cells()[0]).toHaveClass('h-14', 'w-12', 'rounded-lg', 'text-xl');
  });

  it('yozish: fokus keyingi katakka o`tadi, onComplete chaqiriladi', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const onValueChange = vi.fn();
    render(<OtpInput onComplete={onComplete} onValueChange={onValueChange} />);
    await user.click(cells()[0]!);
    await user.keyboard('12a3456');
    expect(values()).toBe('123456');
    expect(onValueChange).toHaveBeenLastCalledWith('123456');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('123456');
    expect(cells()[5]).toHaveFocus();
  });

  it('bitta katakka joylash — hammasi to`ladi', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OtpInput onComplete={onComplete} />);
    await user.click(cells()[0]!);
    await user.paste('Kod: 482 913');
    expect(values()).toBe('482913');
    expect(onComplete).toHaveBeenCalledWith('482913');
  });

  it('Backspace oldingi katakka qaytadi, ← → yuradi', async () => {
    const user = userEvent.setup();
    render(<OtpInput defaultValue="123" />);
    await user.click(cells()[3]!);
    expect(cells()[3]).toHaveFocus();
    await user.keyboard('{Backspace}');
    expect(values()).toBe('12');
    expect(cells()[2]).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(cells()[1]).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(cells()[2]).toHaveFocus();
    // bo'sh katakdan keyingisiga o'tib bo'lmaydi
    await user.keyboard('{ArrowRight}');
    expect(cells()[2]).toHaveFocus();
  });

  it('uzoqdagi bo`sh katakka bosilsa — birinchi bo`sh katakka o`tadi', async () => {
    const user = userEvent.setup();
    render(<OtpInput defaultValue="1" />);
    await user.click(cells()[5]!);
    expect(cells()[1]).toHaveFocus();
  });

  it('to`la katakka yozilsa — almashtiriladi', async () => {
    const user = userEvent.setup();
    render(<OtpInput defaultValue="123456" />);
    await user.click(cells()[1]!);
    await user.keyboard('9');
    expect(values()).toBe('193456');
    expect(cells()[2]).toHaveFocus();
  });

  it('alphanumeric', async () => {
    const user = userEvent.setup();
    render(<OtpInput type="alphanumeric" length={4} />);
    expect(cells()[0]).toHaveAttribute('inputmode', 'text');
    expect(cells()[0]).toHaveAccessibleName('1-belgi');
    await user.click(cells()[0]!);
    await user.keyboard('a-B9z');
    expect(values()).toBe('aB9z');
  });

  it('invalid: aria-invalid, data-invalid va silkinish (reduced-motion bo`lmasa)', () => {
    const animate = vi.fn();
    const original = HTMLElement.prototype.animate;
    HTMLElement.prototype.animate = animate as unknown as typeof HTMLElement.prototype.animate;
    const { rerender, container } = render(<OtpInput />);
    expect(animate).not.toHaveBeenCalled();
    rerender(<OtpInput invalid />);
    expect(container.firstChild).toHaveAttribute('data-invalid');
    expect(cells()[0]).toHaveAttribute('aria-invalid', 'true');
    expect(animate).toHaveBeenCalledTimes(1);
    HTMLElement.prototype.animate = original;
  });

  it('reduced-motion — silkinish yo`q', () => {
    const animate = vi.fn();
    const original = HTMLElement.prototype.animate;
    const mm = vi
      .spyOn(window, 'matchMedia')
      .mockImplementation((q) => ({ matches: true, media: q }) as MediaQueryList);
    HTMLElement.prototype.animate = animate as unknown as typeof HTMLElement.prototype.animate;
    const { rerender } = render(<OtpInput />);
    rerender(<OtpInput invalid />);
    expect(animate).not.toHaveBeenCalled();
    HTMLElement.prototype.animate = original;
    mm.mockRestore();
  });

  it('boshqariladigan, disabled, name', async () => {
    function Demo() {
      const [v, setV] = useState('12');
      return (
        <>
          <OtpInput value={v} onValueChange={setV} name="code" />
          <button onClick={() => setV('')}>tozalash</button>
        </>
      );
    }
    const user = userEvent.setup();
    const { container } = render(<Demo />);
    expect(values()).toBe('12');
    expect(container.querySelector('input[type=hidden]')).toHaveValue('12');
    await user.click(screen.getByText('tozalash'));
    expect(values()).toBe('');
  });

  it('disabled', () => {
    render(<OtpInput disabled />);
    cells().forEach((c) => expect(c).toBeDisabled());
  });

  it('Field bilan: label birinchi katakka, guruh nomi', () => {
    render(
      <Field label="Tasdiqlash kodi" error="Kod noto'g'ri">
        <OtpInput />
      </Field>,
    );
    expect(screen.getByRole('group', { name: 'Tasdiqlash kodi' })).toBeInTheDocument();
    expect(screen.getByText('Tasdiqlash kodi')).toHaveAttribute('for', cells()[0]!.id);
    expect(cells()[2]).toHaveAttribute('aria-invalid', 'true');
    expect(cells()[2]).toHaveAccessibleDescription("Kod noto'g'ri");
  });

  it('labels.cell', () => {
    render(<OtpInput length={2} labels={{ cell: (i, n) => `Digit ${i + 1} of ${n}` }} />);
    expect(cells()[1]).toHaveAccessibleName('Digit 2 of 2');
  });
});

describe('ResendTimer', () => {
  afterEach(() => vi.useRealTimers());

  it('taymer tugaguncha bosilmaydi, keyin onResend va qayta boshlanadi', async () => {
    vi.useFakeTimers();
    const onResend = vi.fn();
    render(<ResendTimer seconds={3} onResend={onResend} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('Kodni qayta yuborish (0:03)');
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    act(() => btn.click());
    expect(onResend).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1000));
    expect(btn).toHaveTextContent('(0:02)');
    act(() => vi.advanceTimersByTime(2000));
    expect(btn).toHaveTextContent(/^Kodni qayta yuborish$/);
    expect(btn).not.toHaveAttribute('aria-disabled');
    await act(async () => btn.click());
    expect(onResend).toHaveBeenCalledTimes(1);
    expect(btn).toHaveTextContent('(0:03)');
  });

  it('OtpInput.ResendTimer va labels', () => {
    render(<OtpInput.ResendTimer seconds={75} labels={{ resend: 'Qayta yuborish' }} />);
    expect(screen.getByRole('button')).toHaveTextContent('Qayta yuborish (1:15)');
  });
});
