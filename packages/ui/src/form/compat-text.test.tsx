import { zUz } from '@akhatmirzo/core/zod';
import { act, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  BankAccountInput,
  CarPlateInput,
  InnInput,
  PassportInput,
  PinflInput,
} from '../components/document-inputs';
import { Input } from '../components/input';
import { CardInput, MaskedInput, MoneyInput, PhoneInput } from '../components/masked-input';
import { Textarea } from '../components/textarea';
import { expectErrorAndFocus, renderForm } from '../test/form-harness';
import { FormField } from './form-field';

interface TextCase {
  title: string;
  element: ReactElement;
  schema: z.ZodType;
  initial: unknown;
  initialDisplay: string | RegExp;
  typed: string;
  expected: unknown;
  error: string;
}

const cases: TextCase[] = [
  {
    title: 'Input (native onChange)',
    element: <Input />,
    schema: z.string().min(2, 'Kamida 2 harf'),
    initial: 'Ali',
    initialDisplay: 'Ali',
    typed: 'Vali',
    expected: 'Vali',
    error: 'Kamida 2 harf',
  },
  {
    title: 'Textarea (native onChange)',
    element: <Textarea />,
    schema: z.string().min(1, 'Izoh yozing'),
    initial: 'Salom',
    initialDisplay: 'Salom',
    typed: 'Yangi izoh',
    expected: 'Yangi izoh',
    error: 'Izoh yozing',
  },
  {
    title: 'MaskedInput',
    element: <MaskedInput mask="AA 9999999" uppercase />,
    schema: zUz.passport(),
    initial: 'AA1234567',
    initialDisplay: 'AA 1234567',
    typed: 'ab7654321',
    expected: 'AB7654321',
    error: 'Pasport seriya va raqamini kiriting',
  },
  {
    title: 'PhoneInput',
    element: <PhoneInput />,
    schema: zUz.phone(),
    initial: '901234567',
    initialDisplay: /90\D*123\D*45\D*67/,
    typed: '935551122',
    expected: '935551122',
    error: 'Telefon raqamini kiriting',
  },
  {
    title: 'MoneyInput',
    element: <MoneyInput />,
    schema: zUz.money(),
    initial: 1250000,
    initialDisplay: /^1\s250\s000$/,
    typed: '5000',
    expected: 5000,
    error: 'Summani kiriting',
  },
  {
    title: 'CardInput',
    element: <CardInput />,
    schema: zUz.card(),
    initial: '8600123412341234',
    initialDisplay: /^8600 1234 1234 1234$/,
    typed: '4111111111111111',
    expected: '4111111111111111',
    error: 'Karta raqamini kiriting',
  },
  {
    title: 'PinflInput',
    element: <PinflInput />,
    schema: zUz.pinfl(),
    initial: '31503901234567',
    initialDisplay: /^31503\s?90123\s?4567$/,
    typed: '60101201234567',
    expected: '60101201234567',
    error: 'JShShIRni kiriting',
  },
  {
    title: 'PassportInput',
    element: <PassportInput />,
    schema: zUz.passport(),
    initial: 'AA1234567',
    initialDisplay: /^AA\s?1234567$/,
    typed: 'ad7654321',
    expected: 'AD7654321',
    error: 'Pasport seriya va raqamini kiriting',
  },
  {
    title: 'InnInput',
    element: <InnInput />,
    schema: zUz.inn(),
    initial: '123456789',
    initialDisplay: /^123\s?456\s?789$/,
    typed: '987654321',
    expected: '987654321',
    error: 'STIRni kiriting',
  },
  {
    title: 'BankAccountInput',
    element: <BankAccountInput />,
    schema: zUz.bankAccount(),
    initial: '20208000900012345001',
    initialDisplay: /^2020\s?8000\s?9000\s?1234\s?5001$/,
    typed: '20208000900012345002',
    expected: '20208000900012345002',
    error: 'Hisob raqamini kiriting',
  },
  {
    title: 'CarPlateInput',
    element: <CarPlateInput />,
    schema: zUz.carPlate(),
    initial: '01A123BC',
    initialDisplay: /^01\s+A\s+123\s+BC$/,
    typed: '30123abc',
    expected: '30123ABC',
    error: 'Avtomobil raqamini kiriting',
  },
];

describe('FormField — matnli maydonlar', () => {
  it.each(cases)(
    '$title: qiymat kiradi/chiqadi, xato, fokus, reset',
    async ({ element, schema, initial, initialDisplay, typed, expected, error }) => {
      const { user, form, value, submit } = renderForm(
        <FormField name="f" label="Maydon">
          {element}
        </FormField>,
        { schema: z.object({ f: schema }), defaultValues: { f: initial } },
      );
      const input = screen.getByLabelText('Maydon') as HTMLInputElement;
      // qiymat ichkariga
      expect(input.value).toMatch(initialDisplay);

      // qiymat tashqariga
      await user.clear(input);
      await user.type(input, typed);
      expect(value('f')).toEqual(expected);

      // validatsiya xatosi Field ichida, fokus maydonda
      await user.clear(input);
      expect(value('f') || '').toBe('');
      input.blur();
      await submit();
      await expectErrorAndFocus(error);
      expect(input).toHaveFocus();
      expect(input).toHaveAttribute('aria-invalid', 'true');

      // reset
      act(() => form().reset());
      await waitFor(() => expect(input.value).toMatch(initialDisplay));
      expect(value('f')).toEqual(initial);
      expect(screen.queryByText(error)).not.toBeInTheDocument();
    },
  );

  it('native <input>, <select> va checkbox — id/aria Field dan, name uzatiladi', async () => {
    const { user, value, submit, form } = renderForm(
      <>
        <FormField name="city" label="Shahar">
          <select>
            <option value="">—</option>
            <option value="tsh">Toshkent</option>
          </select>
        </FormField>
        <FormField name="note" label="Izoh">
          <input />
        </FormField>
        <FormField name="agree" label="Roziman">
          <input type="checkbox" />
        </FormField>
      </>,
      {
        schema: z.object({
          city: z.string().min(1, 'Shaharni tanlang'),
          agree: z.literal(true, { error: 'Rozilik bering' }),
        }),
        defaultValues: { city: '', note: 'a', agree: false },
      },
    );
    const select = screen.getByLabelText('Shahar');
    const note = screen.getByLabelText('Izoh');
    const agree = screen.getByLabelText('Roziman');
    expect(note).toHaveValue('a');
    expect(note).toHaveAttribute('name', 'note');
    await submit();
    await expectErrorAndFocus('Shaharni tanlang');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Rozilik bering')).toBeInTheDocument();
    await user.selectOptions(select, 'tsh');
    await user.click(agree);
    await user.type(note, 'b');
    expect(form().getValues()).toEqual({ city: 'tsh', note: 'ab', agree: true });
    act(() => form().reset());
    await waitFor(() => expect(agree).not.toBeChecked());
    expect(select).toHaveValue('');
    expect(value('note')).toBe('a');
  });
});
