'use client';

import { Avatar } from '@akhatmirzo/ui';

export default function AvatarImage() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar size="lg" src="https://github.com/Akhatmirzo.png" name="Akhatmirzo" />
      <Avatar size="lg" src="/mavjud-emas.png" name="Gulnora Aliyeva" />
      <Avatar size="lg" />
    </div>
  );
}
