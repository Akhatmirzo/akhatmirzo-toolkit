import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Input } from '../input/input';
import { Textarea } from '../textarea/textarea';
import { Field, useFieldControl } from './field';

function Custom() {
  const { controlProps, invalid } = useFieldControl();
  return <select data-testid="custom" data-bad={invalid ? '' : undefined} {...controlProps} />;
}

describe('Field', () => {
  it('label bosilganda input fokuslanadi (htmlFor ↔ id)', async () => {
    render(
      <Field label="Email">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText('Email');
    expect(input.tagName).toBe('INPUT');
    await userEvent.click(screen.getByText('Email'));
    expect(input).toHaveFocus();
  });

  it('description va error ni aria-describedby ga ulaydi, invalid qiladi', () => {
    render(
      <Field label="Telefon" description="SMS kod yuboriladi" error="Raqam noto'g'ri">
        <Input aria-describedby="tashqi" />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: 'Telefon' });
    expect(input).toHaveAccessibleDescription("SMS kod yuboriladi Raqam noto'g'ri");
    expect(input.getAttribute('aria-describedby')).toContain('tashqi');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.parentElement).toHaveAttribute('data-invalid');
    expect(screen.getByText("Raqam noto'g'ri")).toBeInTheDocument();
  });

  it("error yo'q bo'lsa aria-invalid va error id qo'yilmaydi", () => {
    render(
      <Field label="Ism">
        <Input />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: 'Ism' });
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('xato live region doim mavjud, xato keyin paydo bo`lsa shu region ichida', () => {
    const { container, rerender } = render(
      <Field label="Ism">
        <Input />
      </Field>,
    );
    const region = container.querySelector('[aria-live="polite"]');
    expect(region).toBeInTheDocument();
    expect(region).toBeEmptyDOMElement();
    rerender(
      <Field label="Ism" error="Majburiy">
        <Input />
      </Field>,
    );
    expect(container.querySelector('[aria-live="polite"]')).toBe(region);
    expect(region).toHaveTextContent('Majburiy');
  });

  it('required: * belgisi va aria-required', () => {
    render(
      <Field label="Parol" required>
        <Input />
      </Field>,
    );
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    // accessible name'ga * kirmaydi
    expect(screen.getByRole('textbox', { name: 'Parol' })).toHaveAttribute('aria-required', 'true');
  });

  it("bolaning o'z id'si bo'lsa label shunga ulanadi", () => {
    render(
      <Field label="Izoh">
        <Textarea id="izoh" />
      </Field>,
    );
    expect(screen.getByLabelText('Izoh')).toHaveAttribute('id', 'izoh');
    expect(screen.getByText('Izoh')).toHaveAttribute('for', 'izoh');
  });

  it('disabled bolaga uzatiladi', () => {
    render(
      <Field label="Hudud" disabled>
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText('Hudud')).toBeDisabled();
  });

  it('orientation, className, ref va qolgan props ildizga', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Field
        label="A"
        orientation="horizontal"
        className="max-w-sm"
        data-testid="f"
        ref={(n) => {
          node = n;
        }}
      >
        <Input />
      </Field>,
    );
    const root = screen.getByTestId('f');
    expect(root).toHaveAttribute('data-orientation', 'horizontal');
    expect(root).toHaveClass('max-w-sm', 'flex-row');
    expect(node).toBe(root);
  });

  it('useFieldControl ixtiyoriy elementni ham ulaydi', () => {
    render(
      <Field label="Shahar" error="Tanlang">
        <Custom />
      </Field>,
    );
    const el = screen.getByTestId('custom');
    expect(screen.getByLabelText('Shahar')).toBe(el);
    expect(el).toHaveAttribute('data-bad');
    expect(el).toHaveAccessibleDescription('Tanlang');
  });

  it('Field tashqarisida useFieldControl barqaror id beradi', () => {
    render(<Custom />);
    expect(screen.getByTestId('custom').id).not.toBe('');
  });
});
