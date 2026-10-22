'use client';

import { ColorPicker } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function ColorPickerAlpha() {
  const [color, setColor] = useState('#10b98180');

  return (
    <div className="flex w-full max-w-60 flex-col gap-2">
      <ColorPicker alpha value={color} onValueChange={setColor} aria-label="Fon rangi" />
      <p className="m-0 text-sm text-text-muted">
        Qiymat: <span className="font-mono text-text">{color}</span>
      </p>
    </div>
  );
}
