'use client';

import { passwordStrength } from '@akhatmirzo/core';
import { Badge, Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';

const BAR = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-success', 'bg-success'];
const COLOR = ['danger', 'danger', 'warning', 'success', 'success'] as const;
const CHECKS = {
  length: 'Kamida 8 belgi',
  lower: 'Kichik harf',
  upper: 'Katta harf',
  digit: 'Raqam',
  symbol: 'Belgi (!@#…)',
};

export default function CorePassword() {
  const [password, setPassword] = useState('Parol123');
  const { score, label, checks } = passwordStrength(password);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Field label="Parol">
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <div className="flex gap-1" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${password && i <= Math.max(score, 1) ? BAR[score] : 'bg-surface-muted'}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Badge color={COLOR[score]}>{label}</Badge>
        <span className="text-xs text-text-muted">score: {score}/4</span>
      </div>
      <ul className="flex flex-col gap-1 text-sm">
        {(Object.keys(CHECKS) as (keyof typeof CHECKS)[]).map((key) => (
          <li key={key} className={checks[key] ? 'text-text' : 'text-text-muted'}>
            {checks[key] ? '✓' : '○'} {CHECKS[key]}
          </li>
        ))}
      </ul>
    </div>
  );
}
