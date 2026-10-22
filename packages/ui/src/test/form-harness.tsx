import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, type ReactNode } from 'react';
import { useForm, type Resolver, type UseFormReturn } from 'react-hook-form';
import { expect, vi } from 'vitest';
import type { z } from 'zod';
import { Form, FormSubmit } from '../form';

export type Values = Record<string, unknown>;

/**
 * `FormField` moslik testlari uchun: `Form` + `useForm(zodResolver)` + "Yuborish" tugmasi.
 * `form()` — joriy `useForm` natijasi.
 */
export function renderForm(
  ui: ReactNode,
  options: { schema: z.ZodType; defaultValues: Values; mode?: 'onSubmit' | 'onBlur' | 'onTouched' },
) {
  const ref: { current: UseFormReturn<Values> | null } = { current: null };
  const onSubmit = vi.fn();
  function Harness() {
    const form = useForm<Values>({
      resolver: zodResolver(options.schema as z.ZodObject) as unknown as Resolver<Values>,
      defaultValues: options.defaultValues,
      mode: options.mode,
    });
    useEffect(() => {
      ref.current = form;
    });
    return (
      <Form form={form} onSubmit={onSubmit}>
        {ui}
        <FormSubmit>Yuborish</FormSubmit>
      </Form>
    );
  }
  const user = userEvent.setup();
  const utils = render(<Harness />);
  const form = () => ref.current!;
  return {
    ...utils,
    user,
    onSubmit,
    form,
    value: (name: string) => form().getValues(name),
    submit: () => user.click(screen.getByRole('button', { name: 'Yuborish' })),
  };
}

/** Xato matni Field ichida chiqdi va fokus shu maydon ichida */
export async function expectErrorAndFocus(message: string | RegExp) {
  const text = await screen.findByText(message);
  const field = text.closest('[data-slot="field"]');
  expect(field).toHaveAttribute('data-invalid');
  expect(field!.contains(document.activeElement)).toBe(true);
  return field as HTMLElement;
}
