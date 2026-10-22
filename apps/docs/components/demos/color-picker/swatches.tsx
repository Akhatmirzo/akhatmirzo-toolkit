'use client';

import { ColorPicker } from '@akhatmirzo/ui';

// Faqat brend palitrasidagi ranglar
const brand = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#e11d48'];

export default function ColorPickerSwatches() {
  return (
    <div className="w-full max-w-60">
      <ColorPicker swatches={brand} defaultValue="#10b981" aria-label="Teg rangi" />
    </div>
  );
}
