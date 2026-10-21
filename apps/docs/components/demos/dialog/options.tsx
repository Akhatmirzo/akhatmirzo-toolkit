'use client';

import { Button, Dialog } from '@akhatmirzo/ui';

export default function DialogOptions() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dialog>
        <Dialog.Trigger asChild>
          <Button variant="outline">dismissible=false</Button>
        </Dialog.Trigger>
        <Dialog.Content
          title="Shartlarni o'qing"
          description="Tashqariga bosish yopmaydi — faqat tugma yoki Esc."
          dismissible={false}
        >
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="primary">Roziman</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <Dialog>
        <Dialog.Trigger asChild>
          <Button variant="outline">closeButton=false</Button>
        </Dialog.Trigger>
        <Dialog.Content title="✕ tugmasisiz" closeButton={false} size="sm">
          <p className="m-0 text-sm text-text-muted">Oyna faqat pastdagi tugma bilan yopiladi.</p>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="primary">Yopish</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <Dialog>
        <Dialog.Trigger asChild>
          <Button variant="outline">hideTitle</Button>
        </Dialog.Trigger>
        <Dialog.Content title="Mahsulot rasmi" hideTitle size="sm">
          <div className="grid h-40 place-items-center rounded-xl bg-surface-muted text-sm text-text-muted">
            Sarlavha faqat ekran o'quvchi uchun
          </div>
        </Dialog.Content>
      </Dialog>

      <Dialog>
        <Dialog.Trigger asChild>
          <Button variant="outline">mobileSheet=false</Button>
        </Dialog.Trigger>
        <Dialog.Content
          title="Doim markazda"
          description="Telefonda ham pastdan chiqmaydi."
          mobileSheet={false}
          size="sm"
        >
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="primary">Yaxshi</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
