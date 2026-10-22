'use client';

import { useAsync, useToggle } from '@akhatmirzo/hooks';
import { Badge, Button, Switch } from '@akhatmirzo/ui';

const CITIES = ['Toshkent', 'Samarqand', 'Buxoro', 'Xiva', 'Namangan', 'Andijon', 'Nukus'];
const STATUS_COLOR = {
  idle: 'neutral',
  loading: 'info',
  success: 'success',
  error: 'danger',
} as const;

function fetchCities(fail: boolean): Promise<string[]> {
  const delay = 500 + Math.random() * 1000;
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (fail) reject(new Error('Server javob bermadi'));
      else resolve(CITIES.slice(0, 2 + Math.floor(Math.random() * 5)));
    }, delay),
  );
}

export default function HooksAsync() {
  const [fail, , setFail] = useToggle(false);
  const { status, data, error, run } = useAsync(fetchCities, [], { immediate: false });

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => void run(fail)} loading={status === 'loading'}>
          Yuklash
        </Button>
        <Badge color={STATUS_COLOR[status]} dot>
          {status}
        </Badge>
      </div>
      <Switch checked={fail} onCheckedChange={setFail} label="Xato bilan tugasin" />
      {status === 'error' && error instanceof Error && (
        <p className="text-sm text-danger-soft-foreground">{error.message}</p>
      )}
      {data && <p className="text-sm text-text">{data.join(', ')}</p>}
    </div>
  );
}
