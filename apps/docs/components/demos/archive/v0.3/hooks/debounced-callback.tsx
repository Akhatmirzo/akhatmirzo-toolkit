'use client';

import { useDebouncedCallback } from '@akhatmirzo/hooks';
import { Button, Field, Textarea } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function HooksDebouncedCallback() {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState<string[]>([]);

  const save = useDebouncedCallback((value: string) => {
    setSaved((list) => [`${value.length} belgi saqlandi`, ...list].slice(0, 3));
  }, 800);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Field label="Izoh" description="Avtomatik saqlash: yozishni to'xtatgach 800 ms o'tib">
        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            save(e.target.value);
          }}
          minRows={3}
        />
      </Field>
      <Button size="sm" variant="outline" className="self-start" onClick={save.flush}>
        Hozir saqlash
      </Button>
      <ul className="text-sm text-text-muted">
        {saved.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
