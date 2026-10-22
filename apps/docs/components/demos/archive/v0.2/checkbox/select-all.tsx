'use client';

import { Checkbox, type CheckedState } from '@akhatmirzo/ui';
import { useState } from 'react';

const channels = ['Email', 'SMS', 'Telegram'];

export default function CheckboxSelectAll() {
  const [selected, setSelected] = useState<string[]>(['Email']);
  const all: CheckedState =
    selected.length === channels.length ? true : selected.length > 0 ? 'indeterminate' : false;

  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        label="Barcha kanallar"
        checked={all}
        onCheckedChange={(checked) => setSelected(checked ? channels : [])}
      />
      <div className="flex flex-col gap-3 pl-7">
        {channels.map((channel) => (
          <Checkbox
            key={channel}
            label={channel}
            checked={selected.includes(channel)}
            onCheckedChange={(checked) =>
              setSelected((s) => (checked ? [...s, channel] : s.filter((c) => c !== channel)))
            }
          />
        ))}
      </div>
    </div>
  );
}
