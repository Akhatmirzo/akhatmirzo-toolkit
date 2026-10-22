import { zUz } from '@akhatmirzo/core/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { Input } from '../components/input';
import { Textarea } from '../components/textarea';
import { expectErrorAndFocus, renderForm } from '../test/form-harness';
import { createFormAdapter } from './adapters';
import { Form, FormRootError, FormSubmit } from './form';
import { FormField, useFormField } from './form-field';

describe('Form', () => {
  it('noValidate, handleSubmit: zod transform qilingan qiymat onSubmit ga', async () => {
    const schema = z.object({ phone: zUz.phone(), name: z.string().min(2, 'Ism juda qisqa') });
    const { user, submit, onSubmit, container } = renderForm(
      <>
        <FormField name="name" label="Ism">
          <Input />
        </FormField>
        <FormField name="phone" label="Telefon">
          <Input />
        </FormField>
      </>,
      { schema, defaultValues: { name: '', phone: '' } },
    );
    expect(container.querySelector('form')).toHaveAttribute('novalidate');
    await user.type(screen.getByLabelText('Ism'), 'Ali');
    await user.type(screen.getByLabelText('Telefon'), '+998 90 123 45 67');
    await submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0]).toEqual({ name: 'Ali', phone: '998901234567' });
  });

  it('xato: Field da matn, aria-invalid, aria-describedby; birinchi xatoli maydon fokusda', async () => {
    const schema = z.object({ a: z.string().min(1, 'A majburiy'), b: zUz.email() });
    const { submit } = renderForm(
      <>
        <FormField name="a" label="A" description="Izoh">
          <Input />
        </FormField>
        <FormField name="b" label="Email">
          <Input />
        </FormField>
      </>,
      { schema, defaultValues: { a: '', b: '' } },
    );
    await submit();
    await expectErrorAndFocus('A majburiy');
    const a = screen.getByLabelText('A');
    expect(a).toHaveFocus();
    expect(a).toHaveAttribute('aria-invalid', 'true');
    expect(a).toHaveAccessibleDescription('Izoh A majburiy');
    expect(screen.getByText('Email manzilini kiriting')).toBeInTheDocument();
  });

  it('setFocus(name) maydonni fokuslaydi', async () => {
    const { form } = renderForm(
      <>
        <FormField name="a" label="A">
          <Input />
        </FormField>
        <FormField name="b" label="B">
          <Textarea />
        </FormField>
      </>,
      { schema: z.object({}), defaultValues: { a: '', b: '' } },
    );
    act(() => form().setFocus('b'));
    await waitFor(() => expect(screen.getByLabelText('B')).toHaveFocus());
  });

  it('FormSubmit: yuborilayotganda loading, FormRootError: errors.root', async () => {
    let resolveSave: () => void = () => {};
    function Demo() {
      const form = useForm({ defaultValues: { x: '' } });
      return (
        <Form
          form={form}
          onSubmit={async () => {
            await new Promise<void>((r) => (resolveSave = r));
            form.setError('root.server', { message: 'Server javob bermadi' });
          }}
        >
          <FormRootError />
          <FormSubmit>Saqlash</FormSubmit>
        </Form>
      );
    }
    const user = userEvent.setup();
    render(<Demo />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /Saqlash/ });
    expect(btn).toHaveAttribute('type', 'submit');
    expect(btn).toHaveAttribute('data-variant', 'primary');
    await user.click(btn);
    await waitFor(() => expect(btn).toHaveAttribute('data-loading'));
    await act(async () => resolveSave());
    await waitFor(() => expect(btn).not.toHaveAttribute('data-loading'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Server javob bermadi');
  });

  it('render zaxira yo‘li: value/onValueChange/controlProps', async () => {
    const { user, value } = renderForm(
      <FormField
        name="city"
        label="Shahar"
        render={({ value, onValueChange, controlProps }) => (
          <select
            {...controlProps}
            value={String(value)}
            onChange={(e) => onValueChange(e.target.value)}
          >
            <option value="">—</option>
            <option value="tsh">Toshkent</option>
          </select>
        )}
      />,
      { schema: z.object({}), defaultValues: { city: '' } },
    );
    await user.selectOptions(screen.getByLabelText('Shahar'), 'tsh');
    expect(value('city')).toBe('tsh');
  });

  it('useFormField: maxsus komponent, adapter="none"', async () => {
    function Counter() {
      const { value, onValueChange, id, invalid, error } = useFormField<number>();
      return (
        <button
          type="button"
          id={id}
          data-invalid={invalid ? '' : undefined}
          data-error={error}
          onClick={() => onValueChange(value + 1)}
        >
          {value}
        </button>
      );
    }
    const { user, value, submit } = renderForm(
      <FormField name="n" label="Soni" adapter="none">
        <Counter />
      </FormField>,
      { schema: z.object({ n: z.number().min(2, 'Kamida 2') }), defaultValues: { n: 0 } },
    );
    const btn = screen.getByRole('button', { name: 'Soni' });
    await user.click(btn);
    expect(value('n')).toBe(1);
    await submit();
    await expectErrorAndFocus('Kamida 2');
    expect(btn).toHaveAttribute('data-error', 'Kamida 2');
    expect(() => render(<Counter />)).toThrow(/FormField/);
  });

  it("createFormAdapter: o'z komponentingiz; bolaning o'z handler'i ham chaqiriladi", async () => {
    function Toggle(props: { on?: boolean; onToggle?: (on: boolean) => void }) {
      return (
        <button type="button" aria-pressed={props.on} onClick={() => props.onToggle?.(!props.on)}>
          Yoqish
        </button>
      );
    }
    const own = vi.fn();
    const adapter = createFormAdapter({ valueProp: 'on', changeProp: 'onToggle', empty: false });
    const { user, value } = renderForm(
      <FormField name="t" adapter={adapter}>
        <Toggle onToggle={own} />
      </FormField>,
      { schema: z.object({}), defaultValues: { t: false } },
    );
    await user.click(screen.getByRole('button', { name: 'Yoqish' }));
    expect(value('t')).toBe(true);
    expect(own).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: 'Yoqish' })).toHaveAttribute('aria-pressed', 'true');
  });

  it("control prop'i bilan (FormProvider siz) va rules", async () => {
    function Demo({ onValid }: { onValid: (v: { email: string }) => void }) {
      const form = useForm({
        resolver: zodResolver(z.object({ email: zUz.email() })),
        defaultValues: { email: '' },
      });
      return (
        <form onSubmit={form.handleSubmit(onValid)}>
          <FormField control={form.control} name="email" label="Email">
            <Input />
          </FormField>
          <button type="submit">OK</button>
        </form>
      );
    }
    const onValid = vi.fn();
    const user = userEvent.setup();
    render(<Demo onValid={onValid} />);
    await user.type(screen.getByLabelText('Email'), ' a@b.uz ');
    await user.click(screen.getByRole('button', { name: 'OK' }));
    await waitFor(() => expect(onValid).toHaveBeenCalled());
    expect(onValid.mock.calls[0]![0]).toEqual({ email: 'a@b.uz' });
  });

  it("mode: 'onBlur' — maydon tark etilganda tekshiriladi", async () => {
    const { user } = renderForm(
      <>
        <FormField name="a" label="A">
          <Input />
        </FormField>
        <FormField name="b" label="B">
          <Input />
        </FormField>
      </>,
      {
        schema: z.object({ a: z.string().min(1, 'A majburiy') }),
        defaultValues: { a: '', b: '' },
        mode: 'onBlur',
      },
    );
    await user.click(screen.getByLabelText('A'));
    expect(screen.queryByText('A majburiy')).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('B'));
    expect(await screen.findByText('A majburiy')).toBeInTheDocument();
  });

  it('disabled: FormField va useForm({ disabled })', () => {
    renderForm(
      <FormField name="a" label="A" disabled>
        <Input />
      </FormField>,
      { schema: z.object({}), defaultValues: { a: '' } },
    );
    expect(screen.getByLabelText('A')).toBeDisabled();
  });
});
