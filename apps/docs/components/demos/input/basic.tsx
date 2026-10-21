'use client';

import { Input } from '@akhatmirzo/ui';
import { Search } from 'lucide-react';

export default function InputBasic() {
  return (
    <div className="w-full max-w-sm">
      <Input leftIcon={<Search />} placeholder="Mahsulot qidirish" aria-label="Mahsulot qidirish" />
    </div>
  );
}
