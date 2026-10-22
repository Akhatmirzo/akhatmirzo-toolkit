import type { FileUploadContext } from '@akhatmirzo/ui';

/**
 * Rasmni kvadrat qilib kesib, kichraytiradi va data URL qaytaradi — localStorage'ga sig'ishi
 * uchun (haqiqiy ilovada bu yerda serverga yuklash bo'ladi).
 */
export function resizeImage(file: File, size = 160): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('canvas'));
        return;
      }
      const side = Math.min(img.width, img.height);
      ctx.drawImage(
        img,
        (img.width - side) / 2,
        (img.height - side) / 2,
        side,
        side,
        0,
        0,
        size,
        size,
      );
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Rasmni o'qib bo'lmadi"));
    };
    img.src = url;
  });
}

/** FileUpload uchun soxta yuklash: progressni ko'rsatadi va kichraytirilgan rasmni qaytaradi */
export function uploadAvatar(file: File, { onProgress, signal }: FileUploadContext) {
  return new Promise<string>((resolve, reject) => {
    let percent = 0;
    const timer = setInterval(() => {
      percent = Math.min(100, percent + 20);
      onProgress(percent);
      if (percent === 100) {
        clearInterval(timer);
        resizeImage(file).then(resolve, reject);
      }
    }, 120);
    signal.addEventListener('abort', () => {
      clearInterval(timer);
      reject(new DOMException('Bekor qilindi', 'AbortError'));
    });
  });
}

/** Ishlagan muddat: "2 yil 3 oy", "5 oy", "yangi" */
export function tenure(isoDate: string, now = new Date()) {
  const from = fromIsoDate(isoDate);
  let months = (now.getFullYear() - from.getFullYear()) * 12 + (now.getMonth() - from.getMonth());
  if (now.getDate() < from.getDate()) months -= 1;
  if (months < 0) return 'hali boshlamagan';
  if (months < 1) return 'yangi xodim';
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years ? `${years} yil` : '', rest ? `${rest} oy` : ''].filter(Boolean).join(' ');
}

/** ISO sana ("2024-03-01") ↔ Date — mahalliy vaqt bilan, soat mintaqasi siljimasligi uchun */
export function fromIsoDate(iso: string): Date {
  const [y = 1970, m = 1, d = 1] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Brauzerda matnli fayl yuklab berish */
export function downloadText(filename: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
