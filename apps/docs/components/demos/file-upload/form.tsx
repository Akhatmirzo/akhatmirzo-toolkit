'use client';

import { formatFileSize } from '@akhatmirzo/core';
import { Button, Field, FileUpload } from '@akhatmirzo/ui';
import { useState, type FormEvent } from 'react';

export default function FileUploadForm() {
  const [sent, setSent] = useState<string | null>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const files = (new FormData(e.currentTarget).getAll('rezyume') as File[]).filter(
      (f) => f.size > 0,
    );
    setSent(files.map((f) => `${f.name} (${formatFileSize(f.size)})`).join(', ') || "Fayl yo'q");
  };

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <Field label="Rezyume" description="PDF yoki DOCX, 2 MB gacha">
        <FileUpload
          variant="button"
          name="rezyume"
          accept={['.pdf', '.docx']}
          maxSize={2 * 1024 * 1024}
        />
      </Field>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" size="sm">
          Yuborish
        </Button>
        {sent && <span className="text-sm text-text-muted">{sent}</span>}
      </div>
    </form>
  );
}
