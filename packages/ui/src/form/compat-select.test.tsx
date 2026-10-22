import { zUz } from '@akhatmirzo/core/zod';
import { act, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { Combobox } from '../components/combobox';
import { DatePicker, DateRangePicker } from '../components/date-picker';
import { RegionSelect } from '../components/region-select';
import { Select } from '../components/select';
import { expectErrorAndFocus, renderForm } from '../test/form-harness';
import { FormField } from './form-field';

const TODAY = new Date(2026, 9, 21);
const options = [
  { value: 'tsh', label: 'Toshkent' },
  { value: 'sam', label: 'Samarqand' },
  { value: 'bux', label: 'Buxoro' },
];

describe('FormField — tanlash va sana', () => {
  it('Select: value/onValueChange, placeholder reset', async () => {
    const { user, form, value, submit } = renderForm(
      <FormField name="city" label="Shahar">
        <Select placeholder="Tanlang">
          <Select.Item value="tsh">Toshkent</Select.Item>
          <Select.Item value="sam">Samarqand</Select.Item>
        </Select>
      </FormField>,
      {
        schema: z.object({ city: z.string().min(1, 'Shaharni tanlang') }),
        defaultValues: { city: '' },
      },
    );
    const trigger = screen.getByRole('combobox', { name: 'Shahar' });
    await submit();
    await expectErrorAndFocus('Shaharni tanlang');
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Samarqand' }));
    expect(value('city')).toBe('sam');
    expect(trigger).toHaveTextContent('Samarqand');
    act(() => form().reset());
    await waitFor(() => expect(trigger).toHaveTextContent('Tanlang'));
  });

  it("RegionSelect + zUz.region(); portal'ga fokus o'tishi blur hisoblanmaydi", async () => {
    const { user, form, value, submit, onSubmit } = renderForm(
      <FormField name="region" label="Hudud">
        <RegionSelect />
      </FormField>,
      {
        schema: z.object({ region: zUz.region({ messages: { required: 'Hudud tanlanmagan' } }) }),
        defaultValues: { region: '' },
        mode: 'onBlur',
      },
    );
    const trigger = screen.getByRole('combobox', { name: 'Hudud' });
    await user.click(trigger);
    await screen.findByRole('listbox');
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByText('Hudud tanlanmagan')).not.toBeInTheDocument();
    expect(form().getFieldState('region').isTouched).toBe(false);
    await user.keyboard('{Escape}');
    await submit();
    await expectErrorAndFocus('Hudud tanlanmagan');
    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: /Samarqand/ }));
    expect(value('region')).toBe('samarkand');
    await submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]![0]).toEqual({ region: 'samarkand' });
    act(() => form().reset());
    await waitFor(() => expect(trigger).toHaveTextContent('Hududni tanlang'));
  });

  it('Combobox (bitta): value/onValueChange, null', async () => {
    const { user, form, value, submit } = renderForm(
      <FormField name="city" label="Shahar">
        <Combobox options={options} />
      </FormField>,
      {
        schema: z.object({ city: z.string({ error: 'Shaharni tanlang' }) }),
        defaultValues: { city: null },
      },
    );
    const trigger = screen.getByRole('combobox', { name: 'Shahar' });
    await submit();
    await expectErrorAndFocus('Shaharni tanlang');
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Buxoro' }));
    expect(value('city')).toBe('bux');
    expect(trigger).toHaveTextContent('Buxoro');
    act(() => form().reset());
    await waitFor(() => expect(trigger).not.toHaveTextContent('Buxoro'));
  });

  it('Combobox (multiple): string[]', async () => {
    const { user, form, value, submit } = renderForm(
      <FormField name="cities" label="Shaharlar">
        <Combobox multiple options={options} />
      </FormField>,
      {
        schema: z.object({ cities: z.array(z.string()).min(2, 'Kamida 2 ta') }),
        defaultValues: { cities: ['tsh'] },
      },
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveTextContent('Toshkent');
    await submit();
    await expectErrorAndFocus('Kamida 2 ta');
    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Samarqand' }));
    expect(value('cities')).toEqual(['tsh', 'sam']);
    act(() => form().reset());
    await waitFor(() => expect(value('cities')).toEqual(['tsh']));
  });

  it('DatePicker: Date | null', async () => {
    const { user, form, value, submit } = renderForm(
      <FormField name="birth" label="Tug'ilgan sana">
        <DatePicker today={TODAY} />
      </FormField>,
      {
        schema: z.object({ birth: z.date({ error: 'Sanani kiriting' }) }),
        defaultValues: { birth: null },
      },
    );
    const input = screen.getByRole('textbox', { name: "Tug'ilgan sana" });
    await submit();
    await expectErrorAndFocus('Sanani kiriting');
    expect(input).toHaveFocus();
    await user.keyboard('15031990');
    expect(value('birth')).toEqual(new Date(1990, 2, 15));
    await user.keyboard('{Escape}');
    act(() => form().reset());
    await waitFor(() => expect(input).toHaveValue(''));
    act(() => form().setValue('birth', new Date(2024, 0, 2)));
    await waitFor(() => expect(input).toHaveValue('02.01.2024'));
  });

  it('DateRangePicker: { from, to } | null', async () => {
    const { user, form, value, submit } = renderForm(
      <FormField name="range" label="Davr">
        <DateRangePicker today={TODAY} />
      </FormField>,
      {
        schema: z.object({
          range: z.object({ from: z.date(), to: z.date() }, { error: 'Davrni tanlang' }),
        }),
        defaultValues: { range: null },
      },
    );
    const trigger = screen.getByRole('button', { name: /Davr/ });
    await submit();
    await expectErrorAndFocus('Davrni tanlang');
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Kalendar' });
    await user.click(within(dialog).getByRole('button', { name: /^10 Oktabr 2026/ }));
    await user.click(within(dialog).getByRole('button', { name: /^3 Noyabr 2026/ }));
    expect(value('range')).toEqual({ from: new Date(2026, 9, 10), to: new Date(2026, 10, 3) });
    await waitFor(() => expect(trigger).toHaveTextContent(/10\.10\.2026/));
    act(() => form().reset());
    await waitFor(() => expect(trigger).not.toHaveTextContent(/10\.10\.2026/));
  });
});
