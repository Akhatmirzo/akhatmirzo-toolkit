'use client';

import { Button, DropdownMenu } from '@akhatmirzo/ui';
import { LogOut, Send, Settings, User } from 'lucide-react';

export default function DropdownMenuProfile() {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" leftIcon={<User />}>
          Akmal Karimov
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="w-56">
        <DropdownMenu.Label>akmal@misol.uz</DropdownMenu.Label>
        <DropdownMenu.Group>
          <DropdownMenu.Item icon={<User />} shortcut={['mod', 'P']}>
            Profil
          </DropdownMenu.Item>
          <DropdownMenu.Item icon={<Settings />} shortcut={['mod', ',']}>
            Sozlamalar
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild icon={<Send />}>
            <a href="https://github.com/Akhatmirzo/akhatmirzo-toolkit">Loyiha GitHub'da</a>
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item icon={<LogOut />} variant="danger">
          Chiqish
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
