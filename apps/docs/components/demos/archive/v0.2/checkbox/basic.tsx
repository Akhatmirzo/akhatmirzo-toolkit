'use client';

import { Checkbox } from '@akhatmirzo/ui';

export default function CheckboxBasic() {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox label="Shartlarga roziman" />
      <Checkbox label="Meni eslab qol" defaultChecked />
      <Checkbox label="Qisman tanlangan" checked="indeterminate" />
    </div>
  );
}
