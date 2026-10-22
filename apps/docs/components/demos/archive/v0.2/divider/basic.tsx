'use client';

import { Divider } from '@akhatmirzo/ui';

export default function DividerBasic() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3 text-sm text-text">
      <div className="flex justify-between">
        <span>Mahsulotlar</span>
        <span>220 000 so'm</span>
      </div>
      <div className="flex justify-between text-text-muted">
        <span>Yetkazib berish</span>
        <span>25 000 so'm</span>
      </div>
      <Divider />
      <div className="flex justify-between font-semibold">
        <span>Jami</span>
        <span>245 000 so'm</span>
      </div>
    </div>
  );
}
