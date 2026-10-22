'use client';

import { Combobox, Field, type ComboboxOption } from '@akhatmirzo/ui';
import { useState } from 'react';

const initialTags: ComboboxOption[] = ['dizayn', 'frontend', 'backend', 'mobil'].map((t) => ({
  value: t,
  label: t,
}));

export default function ComboboxCreatable() {
  const [tags, setTags] = useState(initialTags);
  const [chosen, setChosen] = useState<string[]>(['frontend']);

  return (
    <Field
      label="Teglar"
      description="Ro'yxatda yo'q tegni yozing va Enter bosing"
      className="w-full max-w-sm"
    >
      <Combobox
        multiple
        creatable
        options={tags}
        value={chosen}
        onValueChange={setChosen}
        onCreate={(text) => {
          const option = { value: text.toLowerCase(), label: text };
          setTags((prev) => [...prev, option]);
          return option;
        }}
        placeholder="Teg qo'shing"
        leftIcon={null}
      />
    </Field>
  );
}
