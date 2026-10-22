'use client';

import { Field, FileUpload, type FileUploadContext, type FileUploadItem } from '@akhatmirzo/ui';
import { useState } from 'react';

const MB = 1024 * 1024;

/** Soxta yuklash: progress bilan ~2 soniya. Nomida "xato" bo'lsa — tarmoq xatosi */
function fakeUpload(file: File, { onProgress, signal }: FileUploadContext) {
  return new Promise<{ url: string }>((resolve, reject) => {
    let progress = 0;
    const timer = setInterval(() => {
      progress = Math.min(100, progress + 8);
      onProgress(progress);
      if (file.name.includes('xato') && progress > 50) {
        clearInterval(timer);
        reject(new Error('network'));
      } else if (progress === 100) {
        clearInterval(timer);
        resolve({ url: `/uploads/${encodeURIComponent(file.name)}` });
      }
    }, 150);
    signal.addEventListener('abort', () => clearInterval(timer));
  });
}

export default function FileUploadBasic() {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const done = files.filter((f) => f.status === 'done').length;

  return (
    <div className="flex w-full max-w-lg flex-col gap-2">
      <Field label="Hujjatlar">
        <FileUpload
          accept={['image/*', '.pdf']}
          maxSize={5 * MB}
          maxFiles={5}
          multiple
          upload={fakeUpload}
          onFilesChange={setFiles}
        />
      </Field>
      <p className="text-sm text-text-muted">
        Jami: {files.length} · yuklandi: {done}
      </p>
    </div>
  );
}
