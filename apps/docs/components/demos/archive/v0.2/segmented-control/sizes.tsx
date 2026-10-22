'use client';

import { Button, SegmentedControl } from '@akhatmirzo/ui';

const sizes = ['sm', 'md', 'lg'] as const;

export default function SegmentedControlSizes() {
  return (
    <div className="flex flex-col items-start gap-4">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-3">
          <SegmentedControl size={size} defaultValue="all" aria-label={`Holat, ${size}`}>
            <SegmentedControl.Item value="all">Hammasi</SegmentedControl.Item>
            <SegmentedControl.Item value="paid">To'langan</SegmentedControl.Item>
            <SegmentedControl.Item value="debt">Qarz</SegmentedControl.Item>
          </SegmentedControl>
          <Button size={size} variant="outline">
            Eksport
          </Button>
        </div>
      ))}
    </div>
  );
}
