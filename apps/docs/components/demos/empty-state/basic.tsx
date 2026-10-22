'use client';

import { Button, EmptyState } from '@akhatmirzo/ui';
import { Inbox, Plus } from 'lucide-react';

export default function EmptyStateBasic() {
  return (
    <EmptyState
      icon={<Inbox />}
      title="Buyurtmalar hali yo'q"
      description="Birinchi buyurtma kelganda shu yerda ko'rinadi."
      action={
        <Button variant="primary" leftIcon={<Plus />}>
          Mahsulot qo'shish
        </Button>
      }
      secondaryAction={<Button variant="ghost">Qo'llanma</Button>}
    />
  );
}
