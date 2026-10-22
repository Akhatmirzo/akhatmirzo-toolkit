'use client';

import { Field, TagInput } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function TagInputWithField() {
  const [tags, setTags] = useState(['dizayn', 'frontend']);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Field label="Kalit so'zlar" description="Enter yoki vergul bilan qo'shing">
        <TagInput value={tags} onValueChange={setTags} placeholder="Kalit so'z" />
      </Field>
      <p className="m-0 text-sm text-text-muted">
        Qiymat: <span className="font-mono text-text">{JSON.stringify(tags)}</span>
      </p>
    </div>
  );
}
