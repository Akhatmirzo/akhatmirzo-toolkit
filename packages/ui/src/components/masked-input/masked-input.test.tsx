import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Field } from '../field';
import { ScriptProvider } from '../script';
import {
  applyInput,
  createMoneySpec,
  createPatternSpec,
  deleteBackward,
  phoneSpec,
} from './mask-engine';
import { CardInput, MaskedInput, MoneyInput, PhoneInput } from './masked-input';

const box = () => screen.getByRole('textbox') as HTMLInputElement;

describe('mask-engine', () => {
  it('telefon: o`rtaga yozilganda kursor joyida qoladi', () => {
    // "(90) 123|-45-67" → "0" yoziladi
    const res = applyInput(phoneSpec, '901234567', '(90) 1230-45-67', 9);
    expect(res.raw).toBe('901230456');
    expect(phoneSpec.format(res.raw).text).toBe('(90) 123-04-56');
    expect(res.caret).toBe(10);
  });

  it('Backspace doimiy belgi oldida — oldingi raqamni o`chiradi', () => {
    // "(90) 123-|45-67"
    const res = deleteBackward(phoneSpec, '901234567', 9)!;
    expect(res.raw).toBe('90124567');
    expect(phoneSpec.format(res.raw).text).toBe('(90) 124-56-7');
    expect(res.caret).toBe(7);
    // oldingi belgi raqam bo'lsa — brauzerga qoldiriladi
    expect(deleteBackward(phoneSpec, '901234567', 8)).toBeNull();
  });

  it('pul: yetakchi nollar, kasr, max', () => {
    const spec = createMoneySpec(2, 1000);
    expect(spec.conform('0012.345', '')).toBe('12.34');
    expect(spec.conform('.5', '')).toBe('0.5');
    expect(spec.conform('1001', '99')).toBe('99');
    expect(spec.format('1250.5').text).toBe('1 250.5');
  });

  it('umumiy niqob: mos kelmagan belgi tashlanadi, doimiy belgilar faqat ichkarida', () => {
    const spec = createPatternSpec('AA 9999999', true);
    expect(spec.conform('a1b2345678x', '')).toBe('AB2345678');
    expect(spec.format('AB').text).toBe('AB');
    expect(spec.format('AB1').text).toBe('AB 1');
  });
});

describe('PhoneInput', () => {
  it('yozish: ko`rinish formatlanadi, qiymat toza 9 raqam', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<PhoneInput aria-label="Telefon" onValueChange={onValueChange} />);
    expect(screen.getByText('+998')).toBeInTheDocument();
    await user.type(box(), '901234567');
    expect(box()).toHaveValue('(90) 123-45-67');
    expect(onValueChange).toHaveBeenLastCalledWith('901234567', {
      valid: true,
      operator: '90',
      complete: true,
    });
    expect(box()).toHaveAttribute('inputmode', 'tel');
    expect(box()).toHaveAttribute('autocomplete', 'tel-national');
  });

  it('ortiqcha raqam va harflar qabul qilinmaydi', async () => {
    const user = userEvent.setup();
    render(<PhoneInput aria-label="Telefon" />);
    await user.type(box(), '90a12345678999');
    expect(box()).toHaveValue('(90) 123-45-67');
  });

  it('"+998 90 123 45 67" joylansa ham to`g`ri tushadi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<PhoneInput aria-label="Telefon" onValueChange={onValueChange} />);
    await user.click(box());
    await user.paste('+998 90 123 45 67');
    expect(box()).toHaveValue('(90) 123-45-67');
    expect(onValueChange).toHaveBeenLastCalledWith('901234567', expect.anything());
  });

  it('noto`g`ri operator kodi — aria-invalid', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<PhoneInput aria-label="Telefon" onValueChange={onValueChange} />);
    await user.type(box(), '12');
    expect(box()).toHaveAttribute('aria-invalid', 'true');
    expect(onValueChange).toHaveBeenLastCalledWith('12', {
      valid: false,
      operator: null,
      complete: false,
    });
    await user.clear(box());
    expect(box()).not.toHaveAttribute('aria-invalid');
  });

  it('Backspace chiziqcha oldida oldingi raqamni o`chiradi', async () => {
    const user = userEvent.setup();
    render(<PhoneInput aria-label="Telefon" defaultValue="901234567" />);
    const el = box();
    await user.click(el);
    el.setSelectionRange(9, 9); // "(90) 123-|45-67"
    await user.keyboard('{Backspace}');
    expect(el).toHaveValue('(90) 124-56-7');
    expect(el.selectionStart).toBe(7);
  });

  it('o`rtadan tahrirlansa kursor sakramaydi', async () => {
    const user = userEvent.setup();
    render(<PhoneInput aria-label="Telefon" defaultValue="901234567" />);
    const el = box();
    await user.click(el);
    el.setSelectionRange(2, 2); // "(9|0)"
    await user.keyboard('1');
    expect(el).toHaveValue('(91) 012-34-56');
    expect(el.selectionStart).toBe(3);
  });

  it('boshqariladigan: tashqi qiymat ko`rinishga tushadi; name — yashirin toza qiymat', async () => {
    const user = userEvent.setup();
    function Demo() {
      const [v, setV] = useState('901234567');
      return (
        <form aria-label="f">
          <PhoneInput aria-label="Telefon" name="phone" value={v} onValueChange={setV} />
          <button type="button" onClick={() => setV('')}>
            tozalash
          </button>
        </form>
      );
    }
    const { container } = render(<Demo />);
    expect(box()).toHaveValue('(90) 123-45-67');
    expect(container.querySelector('input[type=hidden]')).toHaveValue('901234567');
    await user.click(screen.getByText('tozalash'));
    expect(box()).toHaveValue('');
    expect(container.querySelector('input[type=hidden]')).toHaveValue('');
  });

  it('Field bilan: label, xato', () => {
    render(
      <Field label="Telefon" error="Raqam to'liq emas">
        <PhoneInput />
      </Field>,
    );
    const el = screen.getByLabelText('Telefon');
    expect(el).toHaveAttribute('aria-invalid', 'true');
    expect(el).toHaveAccessibleDescription("Raqam to'liq emas");
  });
});

describe('MoneyInput', () => {
  it('minglik ajratuvchi va valyuta', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<MoneyInput aria-label="Summa" onValueChange={onValueChange} />);
    await user.type(box(), '1250000');
    expect(box()).toHaveValue('1 250 000');
    expect(onValueChange).toHaveBeenLastCalledWith(1250000);
    expect(screen.getByText("so'm")).toBeInTheDocument();
    expect(box()).toHaveAttribute('inputmode', 'numeric');
  });

  it('bo`sh joy oldida Backspace oldingi raqamni o`chiradi', async () => {
    const user = userEvent.setup();
    render(<MoneyInput aria-label="Summa" defaultValue={1250000} />);
    const el = box();
    await user.click(el);
    el.setSelectionRange(2, 2); // "1 |250 000"
    await user.keyboard('{Backspace}');
    expect(el).toHaveValue('250 000');
    expect(el.selectionStart).toBe(0);
  });

  it('decimals, max va min', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <MoneyInput
        aria-label="Summa"
        decimals={2}
        min={1000}
        max={50000}
        onValueChange={onValueChange}
      />,
    );
    await user.type(box(), '12,345');
    expect(box()).toHaveValue('12.34');
    expect(box()).toHaveAttribute('inputmode', 'decimal');
    await user.clear(box());
    await user.type(box(), '600000');
    // 60 000 > max — oxirgi raqamlar qabul qilinmaydi
    expect(box()).toHaveValue('6 000');
    expect(onValueChange).toHaveBeenLastCalledWith(6000);
    await user.clear(box());
    await user.type(box(), '5');
    await user.tab();
    expect(box()).toHaveValue('1 000');
    expect(onValueChange).toHaveBeenLastCalledWith(1000);
  });

  it('boshqariladigan null — bo`sh', () => {
    render(<MoneyInput aria-label="Summa" value={null} currency={null} />);
    expect(box()).toHaveValue('');
    expect(screen.queryByText("so'm")).not.toBeInTheDocument();
  });
});

describe('CardInput', () => {
  it('4 tadan guruh va brend belgisi', async () => {
    const user = userEvent.setup();
    render(<CardInput aria-label="Karta" />);
    await user.type(box(), '8600123');
    expect(box()).toHaveValue('8600 123');
    expect(screen.getByText('UZCARD')).toBeInTheDocument();
    await user.clear(box());
    await user.type(box(), '9860');
    expect(screen.getByText('HUMO')).toBeInTheDocument();
    await user.clear(box());
    await user.type(box(), '55');
    expect(screen.getByText('MC')).toBeInTheDocument();
  });

  it('Luhn: to`liq va noto`g`ri bo`lsa invalid, to`g`ri bo`lsa yo`q', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<CardInput aria-label="Karta" onValueChange={onValueChange} />);
    await user.type(box(), '4111111111111112');
    expect(box()).toHaveValue('4111 1111 1111 1112');
    expect(box()).toHaveAttribute('aria-invalid', 'true');
    await user.keyboard('{Backspace}1');
    expect(box()).not.toHaveAttribute('aria-invalid');
    expect(screen.getByText('VISA')).toBeInTheDocument();
    expect(onValueChange).toHaveBeenLastCalledWith('4111111111111111', {
      brand: 'visa',
      complete: true,
      valid: true,
    });
  });

  it('renderBrand bilan o`z belgisi', () => {
    render(
      <CardInput
        aria-label="Karta"
        defaultValue="8600"
        renderBrand={(b) => <span data-testid="logo">{b}</span>}
      />,
    );
    expect(screen.getByTestId('logo')).toHaveTextContent('uzcard');
  });
});

describe('MaskedInput', () => {
  it('pasport: harf/raqam o`rinlari va katta harf', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <MaskedInput
        mask="AA 9999999"
        uppercase
        aria-label="Pasport"
        onValueChange={onValueChange}
      />,
    );
    await user.type(box(), 'a1b1234567');
    expect(box()).toHaveValue('AB 1234567');
    expect(onValueChange).toHaveBeenLastCalledWith('AB1234567', {
      formatted: 'AB 1234567',
      complete: true,
    });
  });

  it('disabled va readOnly', () => {
    const { unmount } = render(<MaskedInput mask="99-99" disabled aria-label="x" />);
    expect(box()).toBeDisabled();
    unmount();
    render(<MaskedInput mask="99-99" readOnly defaultValue="1234" aria-label="x" />);
    expect(box()).toHaveValue('12-34');
    expect(box()).toHaveAttribute('readonly');
  });

  it('ref ichki input`ga', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<MaskedInput mask="99" ref={ref} aria-label="x" />);
    expect(ref.current).toBe(box());
  });
});

describe('MoneyInput showWords', () => {
  const words = (c: HTMLElement) => c.querySelector('[data-slot="money-input-words"]')!;

  it('summa ostida so`z bilan (lotin), yozish bilan yangilanadi, aria-live', async () => {
    const user = userEvent.setup();
    const { container } = render(<MoneyInput aria-label="Summa" showWords />);
    const el = words(container);
    expect(el).toHaveAttribute('aria-live', 'polite');
    expect(el).toHaveClass('text-xs', 'text-text-muted');
    expect(el).toHaveTextContent('');
    expect(box().getAttribute('aria-describedby')).toContain(el.id);
    await user.type(box(), '1250000');
    expect(el).toHaveTextContent('Bir million ikki yuz ellik ming soʻm');
    await user.type(box(), '{Backspace}');
    expect(el).toHaveTextContent('Yuz yigirma besh ming soʻm');
  });

  it('kirill: script opsiyasi va ScriptProvider', () => {
    const { container, unmount } = render(
      <MoneyInput aria-label="Summa" defaultValue={1000} showWords={{ script: 'cyrillic' }} />,
    );
    expect(words(container)).toHaveTextContent('Минг сўм');
    unmount();
    const r = render(
      <ScriptProvider defaultScript="cyrillic">
        <MoneyInput aria-label="Summa" defaultValue={2500} showWords />
      </ScriptProvider>,
    );
    expect(words(r.container)).toHaveTextContent('Икки минг беш юз сўм');
  });

  it('formal va boshqariladigan qiymat', () => {
    const { container, rerender } = render(
      <MoneyInput aria-label="Summa" value={1100} showWords={{ formal: true }} />,
    );
    expect(words(container)).toHaveTextContent('Bir ming bir yuz soʻm');
    rerender(<MoneyInput aria-label="Summa" value={null} showWords={{ formal: true }} />);
    expect(words(container)).toHaveTextContent('');
  });

  it('Field ichida: description va so`zlar ikkalasi aria-describedby da', () => {
    const { container } = render(
      <Field label="Summa" description="Shartnoma summasi">
        <MoneyInput defaultValue={5000} showWords />
      </Field>,
    );
    const describedBy = box().getAttribute('aria-describedby')!.split(' ');
    expect(describedBy).toHaveLength(2);
    expect(describedBy).toContain(words(container).id);
    expect(screen.getByText('Shartnoma summasi')).toBeInTheDocument();
  });

  it('showWords siz — so`zlar bloki yo`q', () => {
    const { container } = render(<MoneyInput aria-label="Summa" defaultValue={5000} />);
    expect(container.querySelector('[data-slot="money-input-words"]')).toBeNull();
  });
});
