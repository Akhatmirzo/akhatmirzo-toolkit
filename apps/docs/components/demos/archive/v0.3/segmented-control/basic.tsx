'use client';

import { SegmentedControl } from '@akhatmirzo/ui';

export default function SegmentedControlBasic() {
  return (
    <SegmentedControl defaultValue="month" aria-label="Davr">
      <SegmentedControl.Item value="day">Kun</SegmentedControl.Item>
      <SegmentedControl.Item value="week">Hafta</SegmentedControl.Item>
      <SegmentedControl.Item value="month">Oy</SegmentedControl.Item>
      <SegmentedControl.Item value="year">Yil</SegmentedControl.Item>
    </SegmentedControl>
  );
}
