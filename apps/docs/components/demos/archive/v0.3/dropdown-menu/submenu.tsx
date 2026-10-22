'use client';

import { DropdownMenu, IconButton } from '@akhatmirzo/ui';
import { Archive, Ellipsis, Pencil, Share2, Trash2 } from 'lucide-react';

export default function DropdownMenuSubmenu() {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton variant="outline" aria-label="Ko'proq amallar">
          <Ellipsis />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item icon={<Pencil />}>Nomini o'zgartirish</DropdownMenu.Item>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger icon={<Share2 />}>Ulashish</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item>Telegram</DropdownMenu.Item>
            <DropdownMenu.Item>Email orqali</DropdownMenu.Item>
            <DropdownMenu.Item shortcut={['mod', 'L']}>Havolani nusxalash</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger icon={<Archive />}>Ko'chirish</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item>Kiruvchi</DropdownMenu.Item>
            <DropdownMenu.Item>Arxiv</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Separator />
        <DropdownMenu.Item icon={<Trash2 />} variant="danger">
          O'chirish
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
