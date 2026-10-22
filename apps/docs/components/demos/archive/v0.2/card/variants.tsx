'use client';

import { Card } from '@akhatmirzo/ui';

export default function CardVariants() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      <Card variant="elevated" padding="sm">
        <Card.Header title="Elevated" description="Soya va chegara (standart)" />
      </Card>
      <Card variant="outline" padding="sm">
        <Card.Header title="Outline" description="Faqat chegara" />
      </Card>
      <Card variant="soft" padding="sm">
        <Card.Header title="Soft" description="Och kulrang fon" />
      </Card>
    </div>
  );
}
