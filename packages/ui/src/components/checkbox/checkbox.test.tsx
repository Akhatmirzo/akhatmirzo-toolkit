import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Field } from '../field/field';
import { Checkbox, type CheckedState } from './checkbox';

describe('Checkbox', () => {
  it('native checkbox va label bilan render qilinadi', () => {
    render(<Checkbox label="Eslab qolish" />);
    const box = screen.getByRole('checkbox', { name: 'Eslab qolish' });
    expect(box).toHaveAttribute('type', 'checkbox');
    expect(box).not.toBeChecked();
  });

  it('label bosilganda belgilanadi (boshqarilmaydigan)', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Yangiliklar" onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByText('Yangiliklar'));
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    await user.click(screen.getByText('Yangiliklar'));
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it('Space bilan almashtiriladi', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Shartlar" />);
    await user.tab();
    const box = screen.getByRole('checkbox');
    expect(box).toHaveFocus();
    await user.keyboard(' ');
    expect(box).toBeChecked();
  });

  it('boshqariladigan rejimda faqat prop bo‘yicha o‘zgaradi', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox label="A" checked={false} onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('indeterminate holati: DOM xususiyati, aria-checked="mixed" va data-state', async () => {
    const user = userEvent.setup();
    function Demo() {
      const [v, setV] = useState<CheckedState>('indeterminate');
      return <Checkbox label="Hammasi" checked={v} onCheckedChange={setV} />;
    }
    const { container } = render(<Demo />);
    const box = screen.getByRole('checkbox') as HTMLInputElement;
    expect(box.indeterminate).toBe(true);
    expect(box).toHaveAttribute('aria-checked', 'mixed');
    expect(container.firstChild).toHaveAttribute('data-state', 'indeterminate');

    await user.click(box);
    expect(box.indeterminate).toBe(false);
    expect(box).toBeChecked();
    expect(container.firstChild).toHaveAttribute('data-state', 'checked');
  });

  it('description aria-describedby orqali ulanadi va nomga kirmaydi', () => {
    render(<Checkbox label="Xabarlar" description="Haftasiga bir marta" />);
    const box = screen.getByRole('checkbox', { name: 'Xabarlar' });
    expect(box).toHaveAccessibleDescription('Haftasiga bir marta');
  });

  it('disabled bo‘lsa o‘zgarmaydi', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Checkbox label="O‘chiq" disabled onCheckedChange={onCheckedChange} />,
    );
    await user.click(screen.getByText('O‘chiq'));
    expect(screen.getByRole('checkbox')).toBeDisabled();
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(container.firstChild).toHaveAttribute('data-disabled');
  });

  it('size, className, ref va qolgan atributlarni qo‘llaydi', () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <Checkbox ref={ref} size="sm" className="custom" name="agree" aria-invalid="true" />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('custom');
    expect(root).toHaveAttribute('data-size', 'sm');
    expect(ref.current).toBe(screen.getByRole('checkbox'));
    expect(ref.current).toHaveAttribute('name', 'agree');
    expect(ref.current).toHaveAttribute('aria-invalid', 'true');
  });

  it('defaultChecked bilan boshlanadi', () => {
    render(<Checkbox defaultChecked aria-label="X" />);
    expect(screen.getByRole('checkbox', { name: 'X' })).toBeChecked();
  });

  it('Field bilan: label bosilganda belgilanadi, xato va izoh ulanadi', async () => {
    const user = userEvent.setup();
    render(
      <Field label="Shartlar" description="Majburiy" error="Rozilik kerak" required>
        <Checkbox />
      </Field>,
    );
    const box = screen.getByRole('checkbox', { name: /Shartlar/ });
    await user.click(screen.getByText('Shartlar'));
    expect(box).toBeChecked();
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toBeRequired();
    expect(box).toHaveAccessibleDescription('Majburiy Rozilik kerak');
  });

  it('invalid prop: aria-invalid va data-invalid', () => {
    const { container } = render(<Checkbox label="A" invalid />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
    expect(container.firstChild).toHaveAttribute('data-invalid');
  });

  it('Field disabled bo‘lsa o‘chadi', () => {
    render(
      <Field label="O‘chiq" disabled>
        <Checkbox />
      </Field>,
    );
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it("label yo'q bo'lsa izoh nom bo'ladi va ikkinchi marta tasvir sifatida qo'shilmaydi", () => {
    render(<Checkbox description="Yangiliklarni olish" />);
    const box = screen.getByRole('checkbox', { name: 'Yangiliklarni olish' });
    expect(box).not.toHaveAttribute('aria-describedby');
  });

  it("aria-label bo'lsa izoh aria-describedby orqali ulanadi", () => {
    render(<Checkbox aria-label="Obuna" description="Haftada bir marta" />);
    expect(screen.getByRole('checkbox', { name: 'Obuna' })).toHaveAccessibleDescription(
      'Haftada bir marta',
    );
  });
});
