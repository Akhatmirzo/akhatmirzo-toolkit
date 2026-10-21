'use client';

import { Field, FileUpload } from '@akhatmirzo/ui';

export default function FileUploadPaste() {
  return (
    <div className="w-full max-w-lg">
      <Field
        label="Skrinshot"
        description="Rasmni nusxalang va sahifaning istalgan joyida Ctrl+V bosing"
      >
        <FileUpload accept={['image/*']} multiple maxFiles={3} paste="global" />
      </Field>
    </div>
  );
}
