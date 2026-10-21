import { formatFileSize, truncateMiddle } from '@akhatmirzo/core';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
  type ComponentProps,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../button';
import { useFieldControl } from '../field/field';
import { IconButton } from '../icon-button';

/* ---------- Tiplar ---------- */

/** `idle` — yuklash funksiyasi yo'q (faqat tanlangan), `uploading`, `done`, `error` */
export type FileUploadStatus = 'idle' | 'uploading' | 'done' | 'error';
/** Xato sababi: noto'g'ri tur, katta hajm yoki yuklashda xato (faqat shunda "Qayta urinish") */
export type FileUploadErrorKind = 'type' | 'size' | 'upload';

export interface FileUploadItem<R = unknown> {
  id: string;
  file: File;
  status: FileUploadStatus;
  /** 0–100 */
  progress: number;
  error?: string;
  errorKind?: FileUploadErrorKind;
  /** `upload` qaytargan natija */
  result?: R;
  /** Rasm bo'lsa — kichik ko'rinish uchun `blob:` manzil */
  previewUrl?: string;
}

export interface FileUploadContext {
  /** Yuklanish foizi, 0–100 */
  onProgress: (percent: number) => void;
  /** Bekor qilinganda `abort` bo'ladi */
  signal: AbortSignal;
}

export interface FileUploadLabels {
  prompt?: string;
  browse?: string;
  dragActive?: string;
  dragReject?: string;
  button?: string;
  images?: string;
  videos?: string;
  audio?: string;
  maxSize?: (size: string) => string;
  maxFiles?: (count: number) => string;
  tooManyFiles?: (count: number) => string;
  invalidType?: string;
  tooLarge?: (size: string) => string;
  uploadError?: string;
  uploaded?: string;
  retry?: string;
  cancel?: string;
  remove?: string;
  dismiss?: string;
  list?: string;
}

const defaultLabels: Required<FileUploadLabels> = {
  prompt: 'Faylni shu yerga tashlang yoki',
  browse: 'tanlang',
  dragActive: "Faylni qo'yib yuboring",
  dragReject: 'Bu turdagi fayl qabul qilinmaydi',
  button: 'Fayl tanlash',
  images: 'Rasmlar',
  videos: 'Video',
  audio: 'Audio',
  maxSize: (size) => `${size} gacha`,
  maxFiles: (count) => `ko'pi bilan ${count} ta`,
  tooManyFiles: (count) => `Ko'pi bilan ${count} ta fayl yuklash mumkin`,
  invalidType: 'Bu turdagi fayl qabul qilinmaydi',
  tooLarge: (size) => `Hajmi ${size} dan katta`,
  uploadError: 'Tarmoq xatosi',
  uploaded: 'Yuklandi',
  retry: 'Qayta urinish',
  cancel: 'Bekor qilish',
  remove: "O'chirish",
  dismiss: 'Olib tashlash',
  list: 'Tanlangan fayllar',
};

export interface FileUploadProps<R = unknown> extends Omit<
  ComponentProps<'div'>,
  'onChange' | 'children' | 'defaultValue'
> {
  /** Ruxsat etilgan turlar: `["image/*", ".pdf", "application/zip"]` */
  accept?: string[];
  /** Eng katta hajm, bayt */
  maxSize?: number;
  /** Eng ko'p fayl soni (`multiple` bo'lmasa — 1) */
  maxFiles?: number;
  multiple?: boolean;
  /** Yuklash funksiyasi. Berilmasa — fayllar faqat tanlanadi (`name` bilan forma orqali yuboriladi) */
  upload?: (file: File, ctx: FileUploadContext) => Promise<R>;
  onFilesChange?: (files: FileUploadItem<R>[]) => void;
  /** Default `dropzone` */
  variant?: 'dropzone' | 'button';
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  /** Forma uchun `<input type="file">` nomi */
  name?: string;
  /** Cheklovlar matni; berilmasa `accept`, `maxSize`, `maxFiles` dan yasaladi */
  hint?: ReactNode;
  /** `Ctrl+V` bilan joylash: `true` — komponent fokusda bo'lganda, `"global"` — sahifaning istalgan joyida */
  paste?: boolean | 'global';
  /** Yuklash xatosidan matn (default — `labels.uploadError`) */
  getErrorMessage?: (error: unknown) => string | undefined;
  labels?: FileUploadLabels;
}

/* ---------- Yordamchilar ---------- */

/** Fayl `accept` ro'yxatiga mosmi. Sudrash paytida nom noma'lum — faqat MIME bo'yicha */
export function matchesAccept(file: { name?: string; type: string }, accept?: string[]): boolean {
  if (!accept?.length) return true;
  const type = file.type.toLowerCase();
  const name = file.name?.toLowerCase();
  return accept.some((entry) => {
    const a = entry.trim().toLowerCase();
    if (!a) return false;
    if (a.startsWith('.')) {
      if (name !== undefined) return name.endsWith(a);
      if (!type) return true;
      const sub = type.split('/')[1] ?? '';
      const ext = a.slice(1);
      return sub === ext || (ext === 'jpg' && sub === 'jpeg') || sub.endsWith(`+${ext}`);
    }
    if (a.endsWith('/*')) return type.startsWith(a.slice(0, -1));
    return type === a;
  });
}

function describeAccept(accept: string[], text: Required<FileUploadLabels>): string {
  const names = accept.map((entry) => {
    const a = entry.trim().toLowerCase();
    if (a === 'image/*') return text.images;
    if (a === 'video/*') return text.videos;
    if (a === 'audio/*') return text.audio;
    if (a.startsWith('.')) return a.slice(1).toUpperCase();
    return (a.split('/')[1] ?? a).toUpperCase();
  });
  return [...new Set(names)].join(', ');
}

const isImage = (file: File) => file.type.startsWith('image/');

function createPreview(file: File): string | undefined {
  if (!isImage(file) || typeof URL.createObjectURL !== 'function') return undefined;
  try {
    return URL.createObjectURL(file);
  } catch {
    return undefined;
  }
}

function revokePreview(url: string | undefined) {
  if (url && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url);
}

const isEditable = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable ||
    el.closest('input, textarea, select, [contenteditable="true"]') !== null);

/* ---------- Ikonkalar ---------- */

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

function UploadIcon() {
  return (
    <svg {...svgProps}>
      <path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 8.5a4 4 0 0 1-.5 9.5" />
      <path d="m9 13 3-3 3 3M12 10v10" />
    </svg>
  );
}

function FileIcon({ label }: { label?: string }) {
  return (
    <svg {...svgProps}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      {!label && <path d="M9 13h6M9 17h4" />}
      {label && (
        <text
          x="12"
          y="17.5"
          textAnchor="middle"
          fontSize="5.5"
          fontWeight="700"
          stroke="none"
          fill="currentColor"
        >
          {label}
        </text>
      )}
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg {...svgProps}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function fileBadge(file: File): string | undefined {
  const ext = file.name.split('.').pop();
  if (!ext || ext === file.name || ext.length > 4) return undefined;
  return ext.toUpperCase();
}

/* ---------- Komponent ---------- */

type DragState = 'idle' | 'over' | 'reject';

/**
 * Fayl yuklash: sudrab tashlash, tanlash, `Ctrl+V`; progress, bekor qilish, qayta urinish.
 * @example
 * <FileUpload accept={['image/*', '.pdf']} maxSize={5 * 1024 * 1024} maxFiles={5} multiple
 *   upload={(file, { onProgress, signal }) => api.upload(file, { onProgress, signal })} />
 */
export function FileUpload<R = unknown>({
  accept,
  maxSize,
  maxFiles: maxFilesProp,
  multiple = false,
  upload,
  onFilesChange,
  variant = 'dropzone',
  disabled: disabledProp,
  invalid: invalidProp,
  required: requiredProp,
  name,
  hint: hintProp,
  paste = true,
  getErrorMessage,
  labels,
  className,
  id,
  'aria-describedby': ariaDescribedBy,
  ...props
}: FileUploadProps<R>) {
  const field = useFieldControl({
    id,
    invalid: invalidProp,
    disabled: disabledProp,
    required: requiredProp,
    'aria-describedby': ariaDescribedBy,
  });
  const { invalid, disabled } = field;
  const text = { ...defaultLabels, ...labels };
  const maxFiles = multiple ? maxFilesProp : 1;
  const hintId = useId();
  const promptId = useId();
  const buttonId = useId();

  const [items, setItems] = useState<FileUploadItem<R>[]>([]);
  const [dragState, setDragState] = useState<DragState>('idle');
  const [notice, setNotice] = useState<string | null>(null);

  const itemsRef = useRef(items);
  const pickerRef = useRef<HTMLInputElement | null>(null);
  const formInputRef = useRef<HTMLInputElement | null>(null);
  const controllers = useRef(new Map<string, AbortController>());
  const dragDepth = useRef(0);
  const nextId = useRef(0);
  // Oxirgi uzatilgan ro'yxat: StrictMode'dagi qayta effektda bo'sh chaqiruv bo'lmasin
  const reportedItems = useRef(items);
  const latest = useRef({ upload, getErrorMessage, onFilesChange, uploadError: text.uploadError });

  useEffect(() => {
    latest.current = { upload, getErrorMessage, onFilesChange, uploadError: text.uploadError };
  });

  const commitItems = useCallback((updater: (prev: FileUploadItem<R>[]) => FileUploadItem<R>[]) => {
    const next = updater(itemsRef.current);
    itemsRef.current = next;
    setItems(next);
  }, []);

  const patch = useCallback(
    (itemId: string, changes: Partial<FileUploadItem<R>>) =>
      commitItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, ...changes } : it))),
    [commitItems],
  );

  // O'zgarishlarni tashqariga va forma maydoniga uzatish
  useEffect(() => {
    if (reportedItems.current !== items) {
      reportedItems.current = items;
      latest.current.onFilesChange?.(items);
    }
    const input = formInputRef.current;
    if (!input || typeof DataTransfer === 'undefined') return;
    try {
      const dt = new DataTransfer();
      items.filter((it) => it.status !== 'error').forEach((it) => dt.items.add(it.file));
      input.files = dt.files;
    } catch {
      // eski brauzerlar: forma maydoni yangilanmaydi
    }
  }, [items]);

  // Yopilganda — yuklashlar to'xtaydi, preview'lar bo'shatiladi
  useEffect(() => {
    const ctrls = controllers.current;
    return () => {
      ctrls.forEach((c) => c.abort());
      ctrls.clear();
      itemsRef.current.forEach((it) => revokePreview(it.previewUrl));
    };
  }, []);

  const startUpload = useCallback(
    (item: FileUploadItem<R>) => {
      const fn = latest.current.upload;
      if (!fn) return;
      controllers.current.get(item.id)?.abort();
      const controller = new AbortController();
      controllers.current.set(item.id, controller);
      patch(item.id, { status: 'uploading', progress: 0, error: undefined, errorKind: undefined });
      const onProgress = (percent: number) => {
        if (controller.signal.aborted || !Number.isFinite(percent)) return;
        patch(item.id, { progress: Math.max(0, Math.min(100, Math.round(percent))) });
      };
      Promise.resolve()
        .then(() => fn(item.file, { onProgress, signal: controller.signal }))
        .then(
          (result) => {
            if (controller.signal.aborted) return;
            controllers.current.delete(item.id);
            patch(item.id, { status: 'done', progress: 100, result });
          },
          (err: unknown) => {
            if (controller.signal.aborted) return;
            controllers.current.delete(item.id);
            const message = latest.current.getErrorMessage?.(err) ?? latest.current.uploadError;
            patch(item.id, { status: 'error', errorKind: 'upload', error: message });
          },
        );
    },
    [patch],
  );

  const removeItem = useCallback(
    (itemId: string) => {
      controllers.current.get(itemId)?.abort();
      controllers.current.delete(itemId);
      const item = itemsRef.current.find((it) => it.id === itemId);
      revokePreview(item?.previewUrl);
      commitItems((prev) => prev.filter((it) => it.id !== itemId));
    },
    [commitItems],
  );

  const addFiles = (incoming: Iterable<File>) => {
    if (disabled) return;
    let files = [...incoming];
    if (!files.length) return;
    if (!multiple) {
      files = files.slice(0, 1);
      itemsRef.current.forEach((it) => removeItem(it.id));
    }
    const counted = itemsRef.current.filter(
      (it) => it.errorKind !== 'type' && it.errorKind !== 'size',
    ).length;
    let accepted = 0;
    let overflow = false;
    const added: FileUploadItem<R>[] = [];
    for (const file of files) {
      const base = { id: `f${++nextId.current}`, file, progress: 0 };
      if (!matchesAccept(file, accept)) {
        added.push({ ...base, status: 'error', errorKind: 'type', error: text.invalidType });
      } else if (maxSize !== undefined && file.size > maxSize) {
        added.push({
          ...base,
          status: 'error',
          errorKind: 'size',
          error: text.tooLarge(formatFileSize(maxSize)),
        });
      } else if (maxFiles !== undefined && counted + accepted >= maxFiles) {
        overflow = true;
      } else {
        accepted++;
        added.push({ ...base, status: 'idle', previewUrl: createPreview(file) });
      }
    }
    setNotice(overflow && maxFiles !== undefined ? text.tooManyFiles(maxFiles) : null);
    if (!added.length) return;
    commitItems((prev) => [...prev, ...added]);
    added.filter((it) => it.status === 'idle').forEach(startUpload);
  };

  const openPicker = () => {
    if (!disabled) pickerRef.current?.click();
  };

  /* ----- Sudrab tashlash ----- */

  const dragVerdict = (e: DragEvent): DragState => {
    const list = [...(e.dataTransfer?.items ?? [])].filter((it) => it.kind === 'file');
    if (list.some((it) => !matchesAccept({ type: it.type }, accept))) return 'reject';
    return 'over';
  };

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    dragDepth.current++;
    setDragState(dragVerdict(e));
  };
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    const verdict = dragVerdict(e);
    if (e.dataTransfer) e.dataTransfer.dropEffect = verdict === 'reject' ? 'none' : 'copy';
    if (verdict !== dragState) setDragState(verdict);
  };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragState('idle');
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepth.current = 0;
    setDragState('idle');
    if (e.dataTransfer?.files) addFiles(e.dataTransfer.files);
  };

  const onDropzoneKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
  };

  /* ----- Clipboard ----- */

  const handlePasteFiles = (data: DataTransfer | null, prevent: () => void) => {
    const files = data?.files;
    if (!files?.length || disabled) return;
    prevent();
    addFiles(files);
  };

  const pasteRef = useRef(handlePasteFiles);
  useEffect(() => {
    pasteRef.current = handlePasteFiles;
  });

  useEffect(() => {
    if (paste !== 'global') return;
    const onPaste = (e: ClipboardEvent) => {
      if (isEditable(e.target)) return;
      pasteRef.current(e.clipboardData, () => e.preventDefault());
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [paste]);

  const onRootPaste = (e: ReactClipboardEvent<HTMLDivElement>) => {
    if (paste !== true || isEditable(e.target)) return;
    handlePasteFiles(e.clipboardData, () => e.preventDefault());
  };

  /* ----- Ko'rinish ----- */

  const hint =
    hintProp !== undefined
      ? hintProp
      : [
          accept?.length ? describeAccept(accept, text) : null,
          maxSize !== undefined ? text.maxSize(formatFileSize(maxSize)) : null,
          multiple && maxFiles !== undefined ? text.maxFiles(maxFiles) : null,
        ]
          .filter(Boolean)
          .join(' · ') || null;

  const describedBy =
    [hint ? hintId : null, field.controlProps['aria-describedby']].filter(Boolean).join(' ') ||
    undefined;

  const picker = (
    <input
      ref={pickerRef}
      type="file"
      id={field.id}
      tabIndex={-1}
      hidden
      disabled={disabled}
      multiple={multiple}
      accept={accept?.join(',')}
      aria-invalid={field.controlProps['aria-invalid']}
      aria-describedby={describedBy}
      onChange={(e) => {
        const files = e.currentTarget.files;
        if (files) addFiles(files);
        e.currentTarget.value = '';
      }}
    />
  );

  return (
    <div
      data-slot="file-upload"
      data-variant={variant}
      data-disabled={disabled ? '' : undefined}
      data-invalid={invalid ? '' : undefined}
      className={cn('flex w-full flex-col gap-2.5 font-sans text-text', className)}
      onPaste={onRootPaste}
      {...props}
    >
      {variant === 'dropzone' ? (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          aria-labelledby={field.labelId ? `${field.labelId} ${promptId}` : promptId}
          aria-describedby={describedBy}
          aria-invalid={field.controlProps['aria-invalid']}
          data-slot="file-upload-dropzone"
          data-drag={dragState}
          className={cn(
            'group/dz flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-border-strong bg-surface px-4 py-7 text-center',
            'transition-[background-color,border-color] duration-base ease-out focus-ring',
            'hover:border-primary',
            'data-[drag=over]:border-primary data-[drag=over]:bg-primary-soft',
            'data-[drag=reject]:border-danger data-[drag=reject]:bg-danger-soft',
            invalid && 'border-danger',
            disabled && 'cursor-not-allowed opacity-50 hover:border-border-strong',
          )}
          onClick={openPicker}
          onKeyDown={onDropzoneKeyDown}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <span
            aria-hidden="true"
            className={cn(
              'mb-1 flex size-13 items-center justify-center rounded-full bg-primary-soft text-primary [&_svg]:size-7',
              'transition-transform duration-moderate ease-out',
              'group-data-[drag=over]/dz:scale-110',
              'group-data-[drag=reject]/dz:bg-surface group-data-[drag=reject]/dz:text-danger',
            )}
          >
            <UploadIcon />
          </span>
          <span
            id={promptId}
            aria-live="polite"
            className={cn(
              'text-sm font-medium text-text',
              dragState === 'reject' && 'text-danger-soft-foreground',
            )}
          >
            {dragState === 'reject' ? (
              text.dragReject
            ) : dragState === 'over' ? (
              text.dragActive
            ) : (
              <>
                {text.prompt} <span className="text-primary">{text.browse}</span>
              </>
            )}
          </span>
          {hint && (
            <span id={hintId} className="text-xs text-text-muted">
              {hint}
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            leftIcon={<UploadIcon />}
            disabled={disabled}
            id={buttonId}
            aria-labelledby={field.labelId ? `${field.labelId} ${buttonId}` : undefined}
            aria-describedby={describedBy}
            onClick={openPicker}
          >
            {text.button}
          </Button>
          {hint && (
            <span id={hintId} className="text-xs text-text-muted">
              {hint}
            </span>
          )}
        </div>
      )}
      {picker}
      {name && (
        <input
          ref={formInputRef}
          type="file"
          name={name}
          multiple={multiple}
          hidden
          tabIndex={-1}
          disabled={disabled}
          aria-hidden="true"
        />
      )}

      <div aria-live="polite" className="empty:hidden">
        {notice && (
          <p className="flex items-center gap-1 text-xs text-danger-soft-foreground">{notice}</p>
        )}
      </div>

      {items.length > 0 && (
        <ul aria-label={text.list} className="m-0 flex list-none flex-col gap-2 p-0">
          {items.map((item) => (
            <FileRow
              key={item.id}
              item={item}
              text={text}
              onRemove={() => removeItem(item.id)}
              onRetry={() => startUpload(item)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FileRow<R>({
  item,
  text,
  onRemove,
  onRetry,
}: {
  item: FileUploadItem<R>;
  text: Required<FileUploadLabels>;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const { file, status, progress } = item;
  const error = status === 'error';
  const removeLabel = status === 'uploading' ? text.cancel : error ? text.dismiss : text.remove;

  return (
    <li
      data-status={status}
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-text',
        error && 'border-danger',
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-muted text-text-muted [&_svg]:size-6">
        {item.previewUrl ? (
          <img src={item.previewUrl} alt="" className="size-full object-cover" />
        ) : (
          <FileIcon label={fileBadge(file)} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-sm font-medium" title={file.name}>
          {truncateMiddle(file.name, 32)}
        </p>
        <p
          className={cn(
            'm-0 mt-0.5 flex items-center gap-1.5 text-xs text-text-muted tabular-nums',
            error && 'text-danger-soft-foreground',
          )}
        >
          <span>{formatFileSize(file.size)}</span>
          {status === 'uploading' && <span aria-hidden="true">· {progress}%</span>}
          {status === 'done' && <span>· {text.uploaded}</span>}
          {error && <span>· {item.error}</span>}
        </p>
        {status === 'uploading' && (
          <div
            role="progressbar"
            aria-label={file.name}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-muted"
          >
            <div
              className="h-full origin-left rounded-full bg-primary transition-transform duration-base ease-linear"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
        )}
      </div>
      {status === 'done' && (
        <span className="flex shrink-0 text-success [&_svg]:size-[18px]">
          <CheckCircleIcon />
        </span>
      )}
      {error && item.errorKind === 'upload' && (
        <Button type="button" variant="link" size="sm" onClick={onRetry}>
          {text.retry}
        </Button>
      )}
      <IconButton
        type="button"
        variant="ghost"
        size="sm"
        aria-label={`${removeLabel}: ${file.name}`}
        onClick={onRemove}
      >
        <XIcon />
      </IconButton>
    </li>
  );
}
