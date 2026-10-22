'use client';

import { ColorPicker } from '@akhatmirzo/ui';

export default function ColorPickerSizes() {
  return (
    <div className="flex w-full max-w-60 flex-col gap-3">
      <ColorPicker size="sm" aria-label="Kichik" />
      <ColorPicker aria-label="O'rtacha" />
      <ColorPicker size="lg" aria-label="Katta" />
      <ColorPicker disabled aria-label="O'chirilgan" />
    </div>
  );
}
