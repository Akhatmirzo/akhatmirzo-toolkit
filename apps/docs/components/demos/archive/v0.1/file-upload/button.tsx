'use client';

import { Field, FileUpload } from '@akhatmirzo/ui';

export default function FileUploadButton() {
  return (
    <div className="w-full max-w-sm">
      <Field label="Pasport nusxasi" description="Old va orqa tomoni">
        <FileUpload
          variant="button"
          accept={['image/*', '.pdf']}
          maxSize={5 * 1024 * 1024}
          maxFiles={2}
          multiple
        />
      </Field>
    </div>
  );
}
