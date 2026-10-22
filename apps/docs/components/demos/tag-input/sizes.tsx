'use client';

import { TagInput } from '@akhatmirzo/ui';

export default function TagInputSizes() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <TagInput size="sm" defaultValue={['sm']} aria-label="Kichik" />
      <TagInput defaultValue={['md']} aria-label="O'rtacha" />
      <TagInput size="lg" defaultValue={['lg']} aria-label="Katta" />
      <TagInput disabled defaultValue={["O'chirilgan"]} aria-label="O'chirilgan" />
    </div>
  );
}
