import type { Runner } from './pm';
import type { Logger, Prompter } from './ui';

export const DEFAULT_REGISTRY = 'https://toolkit.akhatmirzo.uz/r';

export type FetchLike = (
  url: string,
  init?: { headers?: Record<string, string>; signal?: AbortSignal },
) => Promise<{ ok: boolean; status: number; text(): Promise<string> }>;

export interface Context {
  /** Loyiha ildizi (absolyut). Fayllar faqat shu papka ichiga yoziladi. */
  cwd: string;
  /** `--yes`: tasdiqlash savollariga "ha" (mavjud fayllarni qayta yozish bundan mustasno). */
  yes: boolean;
  /** stdin va stdout terminalmi — savol berish mumkinmi. */
  interactive: boolean;
  /** `--no-install`: paket menejeri ishga tushirilmaydi, o'rnatish buyrug'i ko'rsatiladi. */
  noInstall: boolean;
  registry: string;
  env: Record<string, string | undefined>;
  logger: Logger;
  prompter: Prompter;
  fetch: FetchLike;
  run: Runner;
}

/**
 * Tasdiqlash: `--yes` → ha; interaktiv bo'lmasa → yo'q (yon ta'sirsiz); aks holda so'raydi.
 */
export async function confirm(
  ctx: Context,
  question: string,
  defaultValue = true,
): Promise<boolean> {
  if (ctx.yes) return true;
  if (!ctx.interactive) return false;
  return ctx.prompter.confirm(question, defaultValue);
}
