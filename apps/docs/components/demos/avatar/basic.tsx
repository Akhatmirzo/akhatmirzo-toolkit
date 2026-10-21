'use client';

import { Avatar } from '@akhatmirzo/ui';

const people = [
  'Sarvar Abduxoliqov',
  'Malika Rahimova',
  'Jasur Karimov',
  "O'tkir Hoshimov",
  'Dilnoza Yusupova',
  'Rustam Qodirov',
];

export default function AvatarBasic() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {people.map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </div>
  );
}
