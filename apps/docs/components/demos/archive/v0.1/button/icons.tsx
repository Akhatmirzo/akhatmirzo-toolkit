'use client';

import { Button } from '@akhatmirzo/ui';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';

export default function ButtonIcons() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary" leftIcon={<Plus />}>
        Qo'shish
      </Button>
      <Button rightIcon={<ArrowRight />}>Davom etish</Button>
      <Button variant="danger" leftIcon={<Trash2 />}>
        O'chirish
      </Button>
    </div>
  );
}
