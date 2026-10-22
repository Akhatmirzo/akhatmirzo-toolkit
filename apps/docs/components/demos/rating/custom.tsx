'use client';

import { Rating } from '@akhatmirzo/ui';
import { Heart } from 'lucide-react';

export default function RatingCustom() {
  return (
    <div className="flex flex-col gap-4">
      <Rating
        defaultValue={3}
        color="danger"
        icon={<Heart fill="currentColor" strokeWidth={0} />}
      />
      <Rating defaultValue={2} color="primary" size="sm" />
      <Rating defaultValue={7} max={10} />
      <Rating defaultValue={3} disabled />
    </div>
  );
}
