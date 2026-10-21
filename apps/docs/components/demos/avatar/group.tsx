'use client';

import { Avatar, AvatarGroup } from '@akhatmirzo/ui';

const team = [
  'Sarvar Abduxoliqov',
  'Malika Rahimova',
  'Jasur Karimov',
  'Dilnoza Yusupova',
  'Rustam Qodirov',
  'Gulnora Aliyeva',
  'Bekzod Toshmatov',
];

export default function AvatarGroupDemo() {
  return (
    <AvatarGroup max={4} aria-label="Loyiha ishtirokchilari">
      {team.map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </AvatarGroup>
  );
}
