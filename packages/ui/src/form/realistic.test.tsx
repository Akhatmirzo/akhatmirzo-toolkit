import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFieldArray, useForm } from 'react-hook-form';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { z } from 'zod';
import { Checkbox } from '../components/checkbox';
import { Input } from '../components/input';
import { Form, FormField, FormRootError, FormSubmit, createFormAdapter, useFormField } from '.';

/** Haqiqiy forma: ichma-ich obyekt, massiv, transform, har xil adapter yo'llari */
const schema = z.object({
  name: z.string().trim().min(2, 'Ism kamida 2 harf'),
  age: z.string().regex(/^\d+$/, 'Faqat raqam').transform(Number),
  address: z.object({ city: z.string().min(1, 'Shahar kerak') }),
  phones: z.array(z.object({ number: z.string().min(3, 'Raqam qisqa') })).min(1),
  agree: z.literal(true, { error: 'Rozilik kerak' }),
  stars: z.number().min(1, 'Baho bering'),
  color: z.string().min(1, 'Rang tanlang'),
});
type Input_ = z.input<typeof schema>;
type Output = z.output<typeof schema>;

function Stars() {
  const { value, onValueChange, id } = useFormField<number>();
  return (
    <button id={id} type="button" onClick={() => onValueChange((value ?? 0) + 1)}>
      {`stars:${value}`}
    </button>
  );
}

/** "selected" + "onPick" — kutubxonadan tashqari komponent */
function ColorChips(props: { selected?: string; onPick?: (v: string) => void }) {
  return (
    <button type="button" aria-label="qizil" onClick={() => props.onPick?.('red')}>
      {props.selected || '—'}
    </button>
  );
}
const chipsAdapter = createFormAdapter({ valueProp: 'selected', changeProp: 'onPick', empty: '' });

function ProfileForm({ onSubmit }: { onSubmit: (v: Output) => void }) {
  const form = useForm<Input_, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      age: '',
      address: { city: '' },
      phones: [{ number: '' }],
      agree: false as unknown as true,
      stars: 0,
      color: '',
    },
  });
  const phones = useFieldArray({ control: form.control, name: 'phones' });
  return (
    <Form
      form={form}
      onSubmit={(values) => {
        expectTypeOf(values).toEqualTypeOf<Output>();
        expectTypeOf(values.age).toEqualTypeOf<number>();
        onSubmit(values);
      }}
    >
      <FormRootError />
      <FormField name="name" label="Ism">
        <Input />
      </FormField>
      <FormField name="age" label="Yosh">
        <input />
      </FormField>
      <FormField name="address.city" label="Shahar">
        <Input />
      </FormField>
      {phones.fields.map((f, i) => (
        <FormField key={f.id} name={`phones.${i}.number`} label={`Telefon ${i + 1}`}>
          <Input />
        </FormField>
      ))}
      <FormField name="agree" label="Roziman">
        <Checkbox />
      </FormField>
      <FormField name="stars" label="Baho" adapter="none">
        <Stars />
      </FormField>
      <FormField name="color" label="Rang" adapter={chipsAdapter}>
        <ColorChips />
      </FormField>
      <button type="button" onClick={() => form.reset()}>
        Tozalash
      </button>
      <FormSubmit>Yuborish</FormSubmit>
    </Form>
  );
}

describe('Form — haqiqiy ssenariy', () => {
  it('ichma-ich/massiv xatolar, birinchi xatoga fokus, transform, reset', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProfileForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Yuborish' }));
    expect(await screen.findByText('Ism kamida 2 harf')).toBeInTheDocument();
    expect(screen.getByText('Shahar kerak')).toBeInTheDocument();
    expect(screen.getByText('Raqam qisqa')).toBeInTheDocument();
    expect(screen.getByText('Rozilik kerak')).toBeInTheDocument();
    expect(screen.getByText('Baho bering')).toBeInTheDocument();
    expect(screen.getByText('Rang tanlang')).toBeInTheDocument();
    expect(screen.getByLabelText('Ism')).toHaveFocus();
    expect(screen.getByLabelText('Telefon 1')).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Ism'), 'Ali');
    await user.type(screen.getByLabelText('Yosh'), '30');
    await user.type(screen.getByLabelText('Shahar'), 'Toshkent');
    await user.type(screen.getByLabelText('Telefon 1'), '901');
    await user.click(screen.getByRole('checkbox', { name: 'Roziman' }));
    await user.click(screen.getByText('stars:0'));
    await user.click(screen.getByRole('button', { name: 'qizil' }));
    await user.click(screen.getByRole('button', { name: 'Yuborish' }));

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0]).toEqual({
      name: 'Ali',
      age: 30,
      address: { city: 'Toshkent' },
      phones: [{ number: '901' }],
      agree: true,
      stars: 1,
      color: 'red',
    });

    await user.click(screen.getByRole('button', { name: 'Tozalash' }));
    expect(screen.getByLabelText('Ism')).toHaveValue('');
    expect(screen.getByLabelText('Yosh')).toHaveValue('');
    expect(screen.getByRole('checkbox', { name: 'Roziman' })).not.toBeChecked();
    expect(screen.getByText('stars:0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'qizil' })).toHaveTextContent('—');
  });
});
