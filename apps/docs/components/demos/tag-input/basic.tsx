'use client';

import { TagInput } from '@akhatmirzo/ui';

export default function TagInputBasic() {
  return (
    <div className="w-full max-w-md">
      <TagInput
        defaultValue={['React', 'TypeScript']}
        placeholder="Teg qo'shing"
        aria-label="Teglar"
      />
    </div>
  );
}
