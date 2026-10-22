'use client';

import { Alert } from '@akhatmirzo/ui';

export default function AlertVariants() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Alert color="success" variant="soft" title="Soft">
        Yumshoq fon — standart ko'rinish.
      </Alert>
      <Alert color="success" variant="outline" title="Outline">
        Rangli chegara va oddiy fon.
      </Alert>
      <Alert color="success" variant="solid" title="Solid">
        To'q fon — eng ko'p e'tibor tortadi.
      </Alert>
    </div>
  );
}
