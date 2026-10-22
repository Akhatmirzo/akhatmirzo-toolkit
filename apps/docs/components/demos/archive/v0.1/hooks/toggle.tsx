'use client';

import { useToggle } from '@akhatmirzo/hooks';
import { Button, Switch } from '@akhatmirzo/ui';

export default function HooksToggle() {
  const [notify, toggleNotify, setNotify] = useToggle(true);

  return (
    <div className="flex flex-col items-center gap-4">
      <Switch
        checked={notify}
        onCheckedChange={setNotify}
        label="SMS xabarnomalar"
        description={notify ? 'Yoqilgan' : "O'chirilgan"}
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={toggleNotify}>
          Almashtirish
        </Button>
        <Button variant="ghost" onClick={() => setNotify(false)}>
          O'chirish
        </Button>
      </div>
    </div>
  );
}
