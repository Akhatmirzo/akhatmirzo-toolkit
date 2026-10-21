import type { ToastPosition } from '@akhatmirzo/ui';
import { useSyncExternalStore } from 'react';

// Ildizdagi <Toaster /> sozlamalari — Toast sahifasi o'zgartiradi, App o'qiydi
interface ToasterSettings {
  position: ToastPosition;
  closeButton: boolean;
}

let settings: ToasterSettings = { position: 'bottom-right', closeButton: false };
const listeners = new Set<() => void>();

export function setToasterSettings(patch: Partial<ToasterSettings>) {
  settings = { ...settings, ...patch };
  listeners.forEach((l) => l());
}

export function useToasterSettings() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => settings,
  );
}
