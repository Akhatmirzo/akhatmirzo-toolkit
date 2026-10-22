'use client';

import { Field, FileUpload } from '@akhatmirzo/ui';

export default function FileUploadStates() {
  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      <Field label="Faqat rasm" description="Bitta fayl — yangisi eskisini almashtiradi">
        <FileUpload accept={['image/png', 'image/jpeg']} maxSize={1024 * 1024} />
      </Field>
      <Field label="Shartnoma" error="Kamida bitta hujjat yuklang" required>
        <FileUpload accept={['.pdf']} />
      </Field>
      <Field label="O'chirilgan" disabled>
        <FileUpload />
      </Field>
      <Field label="O'z cheklov matni bilan">
        <FileUpload hint="Excel yoki CSV · 10 MB gacha" accept={['.xlsx', '.csv']} />
      </Field>
    </div>
  );
}
