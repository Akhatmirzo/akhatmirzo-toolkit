'use client';

import { cn } from '@akhatmirzo/ui';
import { Form, FormField, FormSubmit } from '@akhatmirzo/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const slots = ['09:00–12:00', '12:00–15:00', '15:00–18:00', '18:00–21:00'];

const schema = z.object({
  slot: z.string().min(1, 'Yetkazib berish vaqtini tanlang'),
});

export default function FormRenderFallback() {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { slot: '' } });

  return (
    <Form
      form={form}
      onSubmit={(data) => alert(`Tanlandi: ${data.slot}`)}
      className="flex w-full max-w-sm flex-col gap-4"
    >
      <FormField
        name="slot"
        label="Yetkazib berish vaqti"
        render={({ value, onValueChange, controlProps, invalid }) => (
          <div {...controlProps} role="radiogroup" className="grid grid-cols-2 gap-2">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                role="radio"
                aria-checked={value === slot}
                onClick={() => onValueChange(slot)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm tabular-nums',
                  value === slot
                    ? 'border-primary bg-primary-soft text-primary-soft-foreground'
                    : 'border-border bg-surface text-text',
                  invalid && value !== slot && 'border-danger',
                )}
              >
                {slot}
              </button>
            ))}
          </div>
        )}
      />
      <FormSubmit>Tasdiqlash</FormSubmit>
    </Form>
  );
}
