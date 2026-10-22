import type { ReactNode } from 'react';

/**
 * Namuna ilovalar uchun bo'sh qobiq: docs navbar'i va sidebar'i yo'q — har bir namuna o'z
 * interfeysini chizadi (yuqorida `ExampleBar` — namunalarga qaytish va mavzu almashtirgich).
 * Provayderlar (tooltip, confirm, toast) ildiz layout'da.
 */
export default function AppsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background font-sans text-text">{children}</div>
  );
}
