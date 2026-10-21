'use client';

import { ConfirmProvider, Toaster, TooltipProvider } from '@akhatmirzo/ui';
import type { ReactNode } from 'react';

/**
 * Kutubxona provayderlari — ilovada bir marta: tooltiplar, `confirm()` va `toast()`
 * demolarda ishlashi uchun.
 */
export function LibraryProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <ConfirmProvider>
        {children}
        <Toaster position="bottom-right" />
      </ConfirmProvider>
    </TooltipProvider>
  );
}
