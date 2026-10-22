'use client';

import { useDocumentVisibility } from '@akhatmirzo/hooks';
import { Badge } from '@akhatmirzo/ui';
import { useEffect, useState } from 'react';

export default function HooksDocumentVisibility() {
  const visibility = useDocumentVisibility();
  const [seconds, setSeconds] = useState(0);

  // Tab yashirin bo'lsa, taymer to'xtaydi — resurs tejaladi
  useEffect(() => {
    if (visibility === 'hidden') return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [visibility]);

  return (
    <div className="flex flex-col items-center gap-3 text-sm text-text">
      <Badge color={visibility === 'visible' ? 'success' : 'neutral'} dot>
        {visibility === 'visible' ? "Tab ko'rinib turibdi" : 'Tab yashirin'}
      </Badge>
      <p>
        Faol vaqt: <span className="font-mono">{seconds} s</span>
      </p>
      <p className="text-text-muted">Boshqa tabga o'tib qayting — hisob to'xtab turadi</p>
    </div>
  );
}
