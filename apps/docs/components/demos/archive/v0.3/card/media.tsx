'use client';

import { Badge, Card } from '@akhatmirzo/ui';

export default function CardMedia() {
  return (
    <Card padding="none" className="w-full max-w-sm overflow-hidden">
      <div className="h-32 bg-linear-to-br from-primary to-info" />
      <div className="flex flex-col gap-3 p-6">
        <Card.Header title="Samarqand bo'ylab sayohat" description="2 kun · 4 ta joy" />
        <Card.Footer>
          <Badge color="success" size="sm">
            Joy bor
          </Badge>
          <Badge size="sm">Guruh</Badge>
        </Card.Footer>
      </div>
    </Card>
  );
}
