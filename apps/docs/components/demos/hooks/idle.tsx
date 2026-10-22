'use client';

import { useIdle, useOnline } from '@akhatmirzo/hooks';
import { Badge } from '@akhatmirzo/ui';

export default function HooksIdle() {
  const idle = useIdle(5000);
  const online = useOnline();

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex flex-wrap justify-center gap-2">
        <Badge color={idle ? 'warning' : 'success'} dot>
          {idle ? 'Nofaol' : 'Faol'}
        </Badge>
        <Badge color={online ? 'success' : 'danger'} dot>
          {online ? 'Internet bor' : "Internet yo'q"}
        </Badge>
      </div>
      <p className="max-w-xs text-sm text-text-muted">
        5 soniya sichqoncha va klaviaturaga tegmang. Tarmoqni o'chirib ko'ring — holat darhol
        yangilanadi.
      </p>
    </div>
  );
}
