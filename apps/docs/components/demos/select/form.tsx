'use client';

import { Button, Field, Select } from '@akhatmirzo/ui';
import { useState, type FormEvent } from 'react';

export default function SelectForm() {
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState('—');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const delivery = String(new FormData(e.currentTarget).get('delivery') ?? '');
    if (!delivery) return setError('Yetkazib berish usulini tanlang');
    setError(undefined);
    setSent(delivery);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-4">
      <Field label="Yetkazib berish" error={error} required>
        <Select name="delivery" onValueChange={() => setError(undefined)}>
          <Select.Item value="courier">Kuryer (1 kun)</Select.Item>
          <Select.Item value="pickup">Olib ketish</Select.Item>
          <Select.Item value="post">Pochta (2–3 kun)</Select.Item>
        </Select>
      </Field>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary">
          Yuborish
        </Button>
        <span className="text-sm text-text-muted">FormData: {sent}</span>
      </div>
    </form>
  );
}
