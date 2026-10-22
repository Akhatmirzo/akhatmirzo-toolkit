'use client';

import { Avatar } from '@akhatmirzo/ui';

export default function AvatarStatus() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar name="Sarvar Abduxoliqov" status="online" />
      <Avatar name="Malika Rahimova" status="offline" />
      <Avatar name="Rustam Qodirov" status="busy" />
      <Avatar name="Jasur Karimov" shape="square" size="lg" status="online" />
    </div>
  );
}
