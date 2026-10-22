'use client';

import { Textarea } from '@akhatmirzo/ui';

export default function TextareaBasic() {
  return (
    <div className="w-full max-w-md">
      <Textarea placeholder="Buyurtma haqida izoh qoldiring" aria-label="Izoh" />
    </div>
  );
}
