'use client';

import { ColorPicker } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function ColorPickerBasic() {
  const [color, setColor] = useState('#4f46e5');

  return (
    <div className="w-full max-w-60">
      <ColorPicker value={color} onValueChange={setColor} aria-label="Asosiy rang" />
    </div>
  );
}
