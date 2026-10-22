'use client';

import { zUz } from '@akhatmirzo/core/zod';
import { Field, Input, Select } from '@akhatmirzo/ui';
import { useState } from 'react';

const schemas = {
  phone: zUz.phone(),
  pinfl: zUz.pinfl(),
  passport: zUz.passport(),
  carPlate: zUz.carPlate(),
  card: zUz.card(),
  money: zUz.money({ min: 1000 }),
  password: zUz.password(),
};

type Kind = keyof typeof schemas;

export default function CoreZod() {
  const [kind, setKind] = useState<Kind>('phone');
  const [text, setText] = useState('+998 90 123 45 67');
  const result = schemas[kind].safeParse(text);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Field label="Sxema">
        <Select value={kind} onValueChange={(v) => setKind(v as Kind)}>
          {Object.keys(schemas).map((k) => (
            <Select.Item key={k} value={k}>{`zUz.${k}()`}</Select.Item>
          ))}
        </Select>
      </Field>
      <Field
        label="Kiritilgan qiymat"
        error={result.success ? undefined : result.error.issues[0]?.message}
      >
        <Input value={text} onChange={(e) => setText(e.target.value)} />
      </Field>
      <p className="text-sm text-text-muted">
        Natija:{' '}
        <code className="text-text">{result.success ? JSON.stringify(result.data) : '—'}</code>
      </p>
    </div>
  );
}
