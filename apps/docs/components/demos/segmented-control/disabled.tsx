'use client';

import { SegmentedControl } from '@akhatmirzo/ui';

export default function SegmentedControlDisabled() {
  return (
    <div className="flex flex-col items-start gap-4">
      <SegmentedControl defaultValue="card" aria-label="To'lov usuli">
        <SegmentedControl.Item value="cash">Naqd</SegmentedControl.Item>
        <SegmentedControl.Item value="card">Karta</SegmentedControl.Item>
        <SegmentedControl.Item value="credit" disabled>
          Nasiya
        </SegmentedControl.Item>
      </SegmentedControl>
      <SegmentedControl defaultValue="uz" disabled aria-label="Til">
        <SegmentedControl.Item value="uz">O'zbekcha</SegmentedControl.Item>
        <SegmentedControl.Item value="ru">Ruscha</SegmentedControl.Item>
      </SegmentedControl>
    </div>
  );
}
