'use client';

import type { UzRegionId } from '@akhatmirzo/core';
import { Field, RegionSelect, ScriptProvider, ScriptToggle } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function RegionSelectDemo() {
  const [region, setRegion] = useState<UzRegionId>('samarkand');

  return (
    <ScriptProvider>
      <div className="flex w-full max-w-sm flex-col gap-4">
        <ScriptToggle size="sm" />
        <Field label="Hudud" description={`Qiymat: "${region}"`}>
          <RegionSelect value={region} onValueChange={setRegion} />
        </Field>
        <Field label="Viloyat" description="includeCity={false}">
          <RegionSelect includeCity={false} />
        </Field>
      </div>
    </ScriptProvider>
  );
}
