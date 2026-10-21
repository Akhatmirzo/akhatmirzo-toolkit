'use client';

import { Textarea } from '@akhatmirzo/ui';

export default function TextareaAutoResize() {
  return (
    <div className="w-full max-w-md">
      <Textarea
        autoResize
        minRows={2}
        maxRows={6}
        placeholder="Yozib ko'ring — maydon matn bilan birga o'sadi"
        aria-label="Xabar"
      />
    </div>
  );
}
