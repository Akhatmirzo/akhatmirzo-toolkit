import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Field } from '../field/field';
import { Radio, RadioGroup, type RadioGroupProps } from './radio-group';

function Payments(props: RadioGroupProps) {
  return (
    <RadioGroup aria-label="To‘lov usuli" {...props}>
      <Radio value="click" label="Click" />
      <Radio value="payme" label="Payme" description="Ilova orqali" />
      <Radio value="cash" label="Naqd" />
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  it('radiogroup va radio rollari bilan render qilinadi', () => {
    render(<Payments />);
    const group = screen.getByRole('radiogroup', { name: 'To‘lov usuli' });
    expect(group).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Payme' })).toHaveAccessibleDescription(
      'Ilova orqali',
    );
  });

  it('barcha radio bir xil name bilan guruhlanadi', () => {
    render(<Payments name="pay" />);
    for (const r of screen.getAllByRole('radio')) expect(r).toHaveAttribute('name', 'pay');
  });

  it('defaultValue va label bosilishi (boshqarilmaydigan)', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Payments defaultValue="click" onValueChange={onValueChange} />);
    expect(screen.getByRole('radio', { name: 'Click' })).toBeChecked();
    await user.click(screen.getByText('Naqd'));
    expect(screen.getByRole('radio', { name: 'Naqd' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Click' })).not.toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith('cash');
  });

  it('boshqariladigan rejim', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<Payments value="click" onValueChange={onValueChange} />);
    await user.click(screen.getByRole('radio', { name: 'Payme' }));
    expect(onValueChange).toHaveBeenCalledWith('payme');
    expect(screen.getByRole('radio', { name: 'Click' })).toBeChecked();
    rerender(<Payments value="payme" onValueChange={onValueChange} />);
    expect(screen.getByRole('radio', { name: 'Payme' })).toBeChecked();
  });

  it('strelkalar bilan yuradi va tanlaydi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Payments defaultValue="click" onValueChange={onValueChange} />);
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Click' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Payme' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Payme' })).toBeChecked();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Naqd' })).toBeChecked();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('radio', { name: 'Payme' })).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith('payme');
  });

  it('Space bilan tanlanadi', async () => {
    const user = userEvent.setup();
    render(<Payments />);
    await user.tab();
    const first = screen.getByRole('radio', { name: 'Click' });
    expect(first).toHaveFocus();
    await user.keyboard(' ');
    expect(first).toBeChecked();
  });

  it('disabled guruh va alohida disabled radio', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<Payments disabled onValueChange={onValueChange} />);
    for (const r of screen.getAllByRole('radio')) expect(r).toBeDisabled();
    await user.click(screen.getByText('Click'));
    expect(onValueChange).not.toHaveBeenCalled();

    rerender(
      <RadioGroup aria-label="X" onValueChange={onValueChange}>
        <Radio value="a" label="A" />
        <Radio value="b" label="B" disabled />
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'B' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'A' })).toBeEnabled();
  });

  it('card varianti, orientation, data-state va className', async () => {
    const user = userEvent.setup();
    render(<Payments variant="card" orientation="horizontal" className="custom" />);
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAttribute('data-variant', 'card');
    expect(group).toHaveAttribute('aria-orientation', 'horizontal');
    expect(group).toHaveClass('custom');
    const card = screen.getByText('Payme').closest('label')!;
    expect(card).toHaveAttribute('data-state', 'unchecked');
    await user.click(card);
    expect(card).toHaveAttribute('data-state', 'checked');
  });

  it('ref radio input’ga yo‘naltiriladi', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <RadioGroup aria-label="X">
        <Radio ref={ref} value="a" aria-label="A" />
      </RadioGroup>,
    );
    expect(ref.current).toBe(screen.getByRole('radio', { name: 'A' }));
  });

  it('RadioGroup tashqarisida xato beradi', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Radio value="a" />)).toThrow();
    spy.mockRestore();
  });

  it('Field bilan: izoh/xato guruhga, invalid/required/disabled radio’larga o‘tadi', () => {
    render(
      <Field label="To‘lov" description="Bittasini tanlang" error="Tanlanmagan" required disabled>
        <Payments />
      </Field>,
    );
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('aria-required', 'true');
    expect(group).toHaveAccessibleDescription('Bittasini tanlang Tanlanmagan');
    for (const r of screen.getAllByRole('radio')) {
      expect(r).toHaveAttribute('aria-invalid', 'true');
      expect(r).toBeRequired();
      expect(r).toBeDisabled();
    }
  });

  it('invalid prop: data-invalid va aria-invalid', () => {
    render(<Payments invalid />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-invalid');
    expect(screen.getAllByRole('radio')[0]).toHaveAttribute('aria-invalid', 'true');
  });

  it("Field label'i guruh nomiga aylanadi", () => {
    render(
      <Field label="To'lov usuli">
        <RadioGroup>
          <Radio value="click" label="Click" />
        </RadioGroup>
      </Field>,
    );
    expect(screen.getByRole('radiogroup', { name: "To'lov usuli" })).toBeInTheDocument();
  });
});
