'use client';

import { Button } from '@akhatmirzo/ui';
import { useState } from 'react';

const EASINGS = [
  ['ease-out', 'Kirishlar (asosiy)'],
  ['ease-in', 'Chiqishlar'],
  ['ease-in-out', "Joyida o'zgarish"],
  ['ease-spring', 'Toast, switch'],
];

export default function ThemingMotion() {
  const [on, setOn] = useState(false);

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <Button size="sm" variant="primary" className="self-start" onClick={() => setOn((v) => !v)}>
        {on ? 'Qaytarish' : 'Ishga tushirish'}
      </Button>
      {EASINGS.map(([easing, note]) => (
        <div key={easing} className="flex items-center gap-3">
          <div className="flex w-28 shrink-0 flex-col text-xs">
            <code className="font-mono text-text">{easing}</code>
            <span className="text-text-muted">{note}</span>
          </div>
          <div className="relative h-6 flex-1 rounded-full bg-surface-muted">
            {/* Qatlam kengligi = yo'lak − sharcha, shuning uchun translate-x-full oxirigacha olib boradi */}
            <div
              className={`absolute inset-y-0 left-0 w-[calc(100%-1.5rem)] transition-transform duration-slow ${easing} ${on ? 'translate-x-full' : ''}`}
            >
              <div className="size-6 rounded-full bg-primary" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
