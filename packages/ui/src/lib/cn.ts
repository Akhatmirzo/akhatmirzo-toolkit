import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Klasslarni birlashtiradi; Tailwind konfliktlarida oxirgisi g'olib (`px-4` + `px-2` → `px-2`). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
