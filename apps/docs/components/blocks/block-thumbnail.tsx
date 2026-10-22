'use client';

import { useResizeObserver } from '@akhatmirzo/hooks';
import { useRef, type ReactNode } from 'react';

/** Blok shu kenglikda chiziladi va kartochkaga sig'diriladi (desktop ko'rinishi) */
const CANVAS_WIDTH = 1280;

/** Galereya uchun kichraytirilgan jonli blok: bosilmaydi, fokuslanmaydi, ekran o'quvchidan yashirin */
export function BlockThumbnail({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(ref);
  const scale = size ? size.width / CANVAS_WIDTH : 0;

  return (
    <div ref={ref} aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div
        inert
        className="pointer-events-none origin-top-left transition-opacity duration-base select-none [&_[data-slot=app-shell]]:[--ak-app-shell-height:800px]"
        style={{
          width: CANVAS_WIDTH,
          minHeight: size && scale ? size.height / scale : undefined,
          transform: `scale(${scale})`,
          opacity: scale ? 1 : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
