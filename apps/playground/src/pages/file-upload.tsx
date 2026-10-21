import {
  Button,
  Field,
  FileUpload,
  type FileUploadContext,
  type FileUploadItem,
} from '@akhatmirzo/ui';
import { formatFileSize } from '@akhatmirzo/core';
import { useState, type FormEvent } from 'react';
import { Code, DemoGrid, DemoPage, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'FileUpload', group: 'Formalar', order: 9 };

const MB = 1024 * 1024;

/**
 * Soxta yuklash: progress bilan, ~2–4 soniya. Nomida "xato" bo'lgan fayl tarmoq xatosi bilan
 * tugaydi (Qayta urinish'ni sinash uchun) — ikkinchi urinishda o'tadi.
 */
const failedOnce = new Set<string>();
function fakeUpload(file: File, { onProgress, signal }: FileUploadContext) {
  return new Promise<{ url: string }>((resolve, reject) => {
    let progress = 0;
    const shouldFail = file.name.toLowerCase().includes('xato') && !failedOnce.has(file.name);
    const timer = setInterval(() => {
      progress = Math.min(100, progress + 4 + Math.random() * 12);
      onProgress(progress);
      if (shouldFail && progress > 55) {
        clearInterval(timer);
        failedOnce.add(file.name);
        reject(new Error('network'));
      } else if (progress >= 100) {
        clearInterval(timer);
        resolve({ url: `/uploads/${encodeURIComponent(file.name)}` });
      }
    }, 120);
    signal.addEventListener('abort', () => {
      clearInterval(timer);
      reject(new DOMException('Bekor qilindi', 'AbortError'));
    });
  });
}

function Summary({ files }: { files: FileUploadItem[] }) {
  if (!files.length) return <p className="text-xs text-text-muted">onFilesChange: —</p>;
  const by = (s: string) => files.filter((f) => f.status === s).length;
  return (
    <p className="text-xs text-text-muted">
      onFilesChange: jami {files.length} · yuklanmoqda {by('uploading')} · tayyor {by('done')} ·
      xato {by('error')}
    </p>
  );
}

function FormDemo() {
  const [sent, setSent] = useState<string | null>(null);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const files = new FormData(e.currentTarget).getAll('rezyume') as File[];
    const real = files.filter((f) => f.size > 0);
    setSent(
      real.length
        ? real.map((f) => `${f.name} (${formatFileSize(f.size)})`).join(', ')
        : 'fayl tanlanmagan',
    );
  };
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <Field label="Rezyume" description="upload yo'q — fayl forma bilan yuboriladi (name)">
        <FileUpload variant="button" name="rezyume" accept={['.pdf', '.docx']} maxSize={2 * MB} />
      </Field>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" size="sm">
          Yuborish
        </Button>
        {sent && (
          <span className="text-xs text-text-muted">
            FormData: <Code>{sent}</Code>
          </span>
        )}
      </div>
    </form>
  );
}

export default function Page() {
  const [files, setFiles] = useState<FileUploadItem[]>([]);

  return (
    <DemoPage
      title="FileUpload"
      description={
        <>
          Sudrab tashlash, tanlash yoki <Code>Ctrl+V</Code> bilan skrinshot joylash. Har bir fayl
          uchun progress, bekor qilish (<Code>AbortController</Code>), xato va "Qayta urinish".
          Dropzone klaviatura bilan: <Code>Tab</Code> → <Code>Enter</Code> / <Code>Space</Code>.
        </>
      }
    >
      <DemoSection
        title="Dropzone"
        description={
          <>
            Soxta yuklash funksiyasi. Nomida <Code>xato</Code> bo'lgan fayl birinchi urinishda
            tarmoq xatosi beradi. Bu sahifada <Code>paste="global"</Code> — istalgan joyda{' '}
            <Code>Ctrl+V</Code>.
          </>
        }
      >
        <Field label="Hujjatlar">
          <FileUpload
            accept={['image/*', '.pdf']}
            maxSize={5 * MB}
            maxFiles={5}
            multiple
            paste="global"
            upload={fakeUpload}
            onFilesChange={setFiles}
          />
        </Field>
        <Summary files={files} />
      </DemoSection>

      <DemoSection
        title="Holatlar"
        description="Fayl sudralganda: mos tur — primary, mos kelmagan tur — danger."
      >
        <DemoGrid min={280}>
          <Field label="Faqat rasmlar" description="Bitta fayl — yangisi eskisini almashtiradi">
            <FileUpload accept={['image/png', 'image/jpeg']} maxSize={MB} upload={fakeUpload} />
          </Field>
          <Field label="Xato holati" error="Kamida bitta hujjat yuklang">
            <FileUpload accept={['.pdf']} />
          </Field>
          <Field label="O'chirilgan" disabled>
            <FileUpload />
          </Field>
          <Field label="O'z cheklov matni bilan">
            <FileUpload hint="Excel yoki CSV · 10 MB gacha" accept={['.xlsx', '.csv']} />
          </Field>
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Button varianti va forma">
        <DemoGrid min={280}>
          <Field label="Pasport nusxasi">
            <FileUpload
              variant="button"
              accept={['image/*', '.pdf']}
              maxSize={5 * MB}
              maxFiles={2}
              multiple
              upload={fakeUpload}
            />
          </Field>
          <FormDemo />
        </DemoGrid>
      </DemoSection>
    </DemoPage>
  );
}
