'use client';

import { createStorage } from '@akhatmirzo/core';
import { Button, Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';

const store = createStorage({ prefix: 'docs-demo:' });

export default function CoreStorage() {
  const [value, setValue] = useState('Sarvar');
  const [result, setResult] = useState('—');

  const save = (ttl?: number) => {
    const ok = store.set('ism', value, { ttl });
    setResult(
      ok ? `Saqlandi${ttl ? ` (${ttl / 1000} soniya)` : ' (muddatsiz)'}` : "Saqlab bo'lmadi",
    );
  };

  const read = () => {
    const saved = store.get<string>('ism');
    setResult(saved === null ? "null — yo'q yoki muddati o'tgan" : JSON.stringify(saved));
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Field label="Qiymat" description="Kalit: docs-demo:ism">
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => save(5000)}>
          5 soniyaga saqlash
        </Button>
        <Button variant="outline" onClick={() => save()}>
          Muddatsiz
        </Button>
        <Button variant="ghost" onClick={read}>
          O'qish
        </Button>
      </div>
      <p className="text-sm text-text-muted">
        Natija: <code className="font-mono text-text">{result}</code>
      </p>
    </div>
  );
}
