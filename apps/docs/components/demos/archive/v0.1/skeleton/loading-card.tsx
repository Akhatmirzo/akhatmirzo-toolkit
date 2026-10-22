'use client';

import { Avatar, Button, Card, Skeleton } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function SkeletonLoadingCard() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <Button size="sm" onClick={() => setLoading((l) => !l)}>
        {loading ? "Kontentni ko'rsatish" : 'Yuklanish holati'}
      </Button>
      <Card variant="outline" className="w-full" aria-busy={loading}>
        <div className="flex items-center gap-3">
          {loading ? (
            <Skeleton variant="circle" className="size-10" />
          ) : (
            <Avatar name="Malika Rahimova" />
          )}
          <div className="flex flex-1 flex-col gap-2">
            {loading ? (
              <Skeleton className="h-4 w-2/5" />
            ) : (
              <b className="text-sm">Malika Rahimova</b>
            )}
            {loading ? (
              <Skeleton className="h-3 w-1/4" />
            ) : (
              <span className="text-xs text-text-muted">2 soat oldin</span>
            )}
          </div>
        </div>
        {loading ? (
          <Skeleton.Text lines={3} />
        ) : (
          <p className="text-sm">
            Buyurtma vaqtida yetib keldi, kuryer juda xushmuomala edi. Keyingi safar ham shu
            do'kondan olaman.
          </p>
        )}
      </Card>
    </div>
  );
}
