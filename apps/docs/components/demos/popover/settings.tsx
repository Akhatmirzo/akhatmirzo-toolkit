'use client';

import { Field, IconButton, Popover, Switch } from '@akhatmirzo/ui';
import { Bell } from 'lucide-react';

export default function PopoverSettings() {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <IconButton variant="outline" aria-label="Bildirishnoma sozlamalari">
          <Bell />
        </IconButton>
      </Popover.Trigger>
      <Popover.Content side="right" align="start" arrow aria-label="Bildirishnomalar">
        <div className="flex flex-col gap-3">
          <p className="m-0 font-semibold">Bildirishnomalar</p>
          <Field label="Email orqali" orientation="horizontal">
            <Switch defaultChecked />
          </Field>
          <Field label="SMS orqali" orientation="horizontal">
            <Switch />
          </Field>
          <Field label="Telegram bot" orientation="horizontal">
            <Switch defaultChecked />
          </Field>
        </div>
      </Popover.Content>
    </Popover>
  );
}
