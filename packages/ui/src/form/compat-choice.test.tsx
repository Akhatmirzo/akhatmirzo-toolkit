import { act, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { Checkbox } from '../components/checkbox';
import { Radio, RadioGroup } from '../components/radio-group';
import { Rating } from '../components/rating';
import { SegmentedControl } from '../components/segmented-control';
import { Slider } from '../components/slider';
import { Switch } from '../components/switch';
import { expectErrorAndFocus, renderForm } from '../test/form-harness';
import { FormField } from './form-field';

describe('FormField — tanlov komponentlari', () => {
  it('Checkbox: checked/onCheckedChange', async () => {
    const { user, form, value, submit } = renderForm(
      <FormField name="agree" label="Shartlarga roziman">
        <Checkbox />
      </FormField>,
      {
        schema: z.object({ agree: z.literal(true, { error: 'Rozilik bering' }) }),
        defaultValues: { agree: false },
      },
    );
    const box = screen.getByRole('checkbox', { name: 'Shartlarga roziman' });
    expect(box).not.toBeChecked();
    await submit();
    await expectErrorAndFocus('Rozilik bering');
    expect(box).toHaveFocus();
    expect(box).toHaveAttribute('aria-invalid', 'true');
    await user.click(box);
    expect(value('agree')).toBe(true);
    act(() => form().reset());
    await waitFor(() => expect(box).not.toBeChecked());
    act(() => form().setValue('agree', true));
    await waitFor(() => expect(box).toBeChecked());
  });

  it('Switch: checked/onCheckedChange', async () => {
    const { user, form, value, submit } = renderForm(
      <FormField name="notify" label="Bildirishnomalar">
        <Switch />
      </FormField>,
      {
        schema: z.object({ notify: z.literal(true, { error: 'Yoqing' }) }),
        defaultValues: { notify: false },
      },
    );
    const sw = screen.getByRole('switch', { name: 'Bildirishnomalar' });
    await submit();
    await expectErrorAndFocus('Yoqing');
    expect(sw).toHaveFocus();
    await user.click(sw);
    expect(value('notify')).toBe(true);
    expect(sw).toBeChecked();
    act(() => form().reset());
    await waitFor(() => expect(sw).not.toBeChecked());
  });

  it('RadioGroup: value/onValueChange, name', async () => {
    const { user, form, value, submit } = renderForm(
      <FormField name="gender" label="Jinsi">
        <RadioGroup>
          <Radio value="male" label="Erkak" />
          <Radio value="female" label="Ayol" />
        </RadioGroup>
      </FormField>,
      {
        schema: z.object({ gender: z.enum(['male', 'female'], { error: 'Jinsni tanlang' }) }),
        defaultValues: { gender: '' },
      },
    );
    const male = screen.getByRole('radio', { name: 'Erkak' });
    expect(male).toHaveAttribute('name', 'gender');
    expect(screen.getByRole('radiogroup', { name: 'Jinsi' })).toBeInTheDocument();
    await submit();
    await expectErrorAndFocus('Jinsni tanlang');
    await user.click(screen.getByRole('radio', { name: 'Ayol' }));
    expect(value('gender')).toBe('female');
    act(() => form().reset());
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Ayol' })).not.toBeChecked());
    act(() => form().setValue('gender', 'male'));
    await waitFor(() => expect(male).toBeChecked());
  });

  it('SegmentedControl: value/onValueChange', async () => {
    const { user, form, value, submit } = renderForm(
      <FormField name="period" label="Davr">
        <SegmentedControl>
          <SegmentedControl.Item value="day">Kun</SegmentedControl.Item>
          <SegmentedControl.Item value="week">Hafta</SegmentedControl.Item>
        </SegmentedControl>
      </FormField>,
      {
        schema: z.object({ period: z.enum(['day', 'week'], { error: 'Davrni tanlang' }) }),
        defaultValues: { period: '' },
      },
    );
    await submit();
    await expectErrorAndFocus('Davrni tanlang');
    await user.click(screen.getByRole('radio', { name: 'Hafta' }));
    expect(value('period')).toBe('week');
    expect(screen.getByRole('radio', { name: 'Hafta' })).toHaveAttribute('data-state', 'checked');
    act(() => form().reset());
    await waitFor(() =>
      expect(screen.getByRole('radio', { name: 'Hafta' })).toHaveAttribute(
        'data-state',
        'unchecked',
      ),
    );
  });

  it('Slider: number[]', async () => {
    const { user, form, value, submit } = renderForm(
      <FormField name="price" label="Narx">
        <Slider min={0} max={100} />
      </FormField>,
      {
        schema: z.object({
          price: z.array(z.number()).refine((v) => (v[0] ?? 0) >= 10, 'Kamida 10'),
        }),
        defaultValues: { price: [5] },
      },
    );
    const thumb = screen.getByRole('slider');
    expect(thumb).toHaveAttribute('aria-valuenow', '5');
    await submit();
    await expectErrorAndFocus('Kamida 10');
    expect(thumb).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(value('price')).toEqual([6]);
    act(() => form().reset());
    await waitFor(() => expect(thumb).toHaveAttribute('aria-valuenow', '5'));
  });

  it('Rating: number', async () => {
    const { user, form, value, submit } = renderForm(
      <FormField name="score" label="Baho">
        <Rating />
      </FormField>,
      {
        schema: z.object({ score: z.number().min(1, "Baho qo'ying") }),
        defaultValues: { score: 0 },
      },
    );
    await submit();
    await expectErrorAndFocus("Baho qo'ying");
    await user.click(screen.getByRole('radio', { name: '4 / 5' }));
    expect(value('score')).toBe(4);
    expect(screen.getByRole('radio', { name: '4 / 5' })).toHaveAttribute('aria-checked', 'true');
    act(() => form().reset());
    await waitFor(() =>
      expect(screen.getByRole('radio', { name: '4 / 5' })).toHaveAttribute('aria-checked', 'false'),
    );
  });
});
