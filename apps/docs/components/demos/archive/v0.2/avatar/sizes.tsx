'use client';

import { Avatar } from '@akhatmirzo/ui';

export default function AvatarSizes() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar size="xs" name="Malika Rahimova" />
        <Avatar size="sm" name="Malika Rahimova" />
        <Avatar size="md" name="Malika Rahimova" />
        <Avatar size="lg" name="Malika Rahimova" />
        <Avatar size="xl" name="Malika Rahimova" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Avatar size="sm" shape="square" name="Bahor Market" />
        <Avatar size="md" shape="square" name="Bahor Market" />
        <Avatar size="lg" shape="square" name="Bahor Market" />
      </div>
    </div>
  );
}
