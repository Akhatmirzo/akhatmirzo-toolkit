'use client';

import { Rating } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function RatingHalf() {
  const [value, setValue] = useState(3.5);

  return (
    <div className="flex items-center gap-3">
      <Rating value={value} onValueChange={setValue} allowHalf size="lg" />
      <span className="text-sm text-text-muted tabular-nums">{value} / 5</span>
    </div>
  );
}
