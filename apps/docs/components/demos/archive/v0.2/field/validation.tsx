'use client';

import { Button, Field, Input } from '@akhatmirzo/ui';
import { useState, type FormEvent } from 'react';

export default function FieldValidation() {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const error = submitted && name.trim().length < 3 ? 'Kamida 3 ta harf kiriting' : undefined;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <form onSubmit={submit} noValidate className="flex w-full max-w-sm flex-col gap-4">
      <Field label="To'liq ism" required error={error}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Sarvar Abduxoliqov"
          autoComplete="name"
        />
      </Field>
      <Button type="submit" variant="primary">
        Davom etish
      </Button>
    </form>
  );
}
