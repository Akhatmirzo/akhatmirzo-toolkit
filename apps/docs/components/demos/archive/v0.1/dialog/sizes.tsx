'use client';

import { Button, Dialog, type DialogSize } from '@akhatmirzo/ui';

const sizes: { size: DialogSize; width: string }[] = [
  { size: 'sm', width: '400px' },
  { size: 'md', width: '520px' },
  { size: 'lg', width: '640px' },
  { size: 'xl', width: '800px' },
  { size: 'full', width: 'butun ekran' },
];

export default function DialogSizes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {sizes.map(({ size, width }) => (
        <Dialog key={size}>
          <Dialog.Trigger asChild>
            <Button variant="outline">{size}</Button>
          </Dialog.Trigger>
          <Dialog.Content
            title={`O'lcham: ${size}`}
            description={`Kenglik — ${width}.`}
            size={size}
          >
            <p className="m-0 text-sm text-text-muted">
              Ekran tor bo'lsa, chetlarda 16px joy qoladi. Telefonda oyna pastdan chiqadi.
            </p>
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant="primary">Tushunarli</Button>
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ))}
    </div>
  );
}
