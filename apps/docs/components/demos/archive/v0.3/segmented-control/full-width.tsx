'use client';

import { SegmentedControl } from '@akhatmirzo/ui';

export default function SegmentedControlFullWidth() {
  return (
    <div className="w-full max-w-sm">
      <SegmentedControl fullWidth defaultValue="delivery" aria-label="Olib ketish usuli">
        <SegmentedControl.Item value="delivery">Yetkazib berish</SegmentedControl.Item>
        <SegmentedControl.Item value="pickup">Olib ketish</SegmentedControl.Item>
      </SegmentedControl>
    </div>
  );
}
