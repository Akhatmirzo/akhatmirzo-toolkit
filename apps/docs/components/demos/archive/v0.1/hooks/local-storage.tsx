'use client';

import { useLocalStorage } from '@akhatmirzo/hooks';
import { Button } from '@akhatmirzo/ui';

function Mirror() {
  const [count] = useLocalStorage('docs-demo:counter', 0);
  return (
    <p className="text-sm text-text-muted">
      Boshqa komponent ko'rayotgan qiymat: <strong className="text-text">{count}</strong>
    </p>
  );
}

export default function HooksLocalStorage() {
  const [count, setCount, remove] = useLocalStorage('docs-demo:counter', 0);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setCount((n) => n - 1)}>
          −
        </Button>
        <span className="min-w-12 text-center text-2xl font-semibold text-text tabular-nums">
          {count}
        </span>
        <Button variant="outline" onClick={() => setCount((n) => n + 1)}>
          +
        </Button>
        <Button variant="ghost" onClick={remove}>
          O'chirish
        </Button>
      </div>
      <Mirror />
      <p className="text-xs text-text-faint">
        Sahifani boshqa tabda oching — qiymat sinxron o'zgaradi
      </p>
    </div>
  );
}
