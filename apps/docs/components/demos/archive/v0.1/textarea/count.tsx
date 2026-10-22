'use client';

import { Textarea } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function TextareaCount() {
  const [bio, setBio] = useState(
    'Frontend dasturchi, Toshkent. React va TypeScript bilan ishlayman.',
  );

  return (
    <div className="w-full max-w-md">
      <Textarea
        showCount
        maxLength={120}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        aria-label="O'zingiz haqingizda"
      />
    </div>
  );
}
