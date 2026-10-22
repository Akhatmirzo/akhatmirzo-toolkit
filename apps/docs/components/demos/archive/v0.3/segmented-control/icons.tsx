'use client';

import { SegmentedControl } from '@akhatmirzo/ui';
import { LayoutGrid, List, MapIcon } from 'lucide-react';

export default function SegmentedControlIcons() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <SegmentedControl defaultValue="grid" aria-label="Ko'rinish">
        <SegmentedControl.Item value="grid" icon={<LayoutGrid />} aria-label="Katakli" />
        <SegmentedControl.Item value="list" icon={<List />} aria-label="Ro'yxat" />
        <SegmentedControl.Item value="map" icon={<MapIcon />} aria-label="Xarita" />
      </SegmentedControl>
      <SegmentedControl defaultValue="list" aria-label="Ko'rinish">
        <SegmentedControl.Item value="grid" icon={<LayoutGrid />}>
          Katakli
        </SegmentedControl.Item>
        <SegmentedControl.Item value="list" icon={<List />}>
          Ro'yxat
        </SegmentedControl.Item>
      </SegmentedControl>
    </div>
  );
}
