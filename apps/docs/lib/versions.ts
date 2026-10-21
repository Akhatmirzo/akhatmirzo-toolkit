import data from './versions.json';

/**
 * Hujjat versiyalari (minor bo'yicha). Har biri `content/docs/<versiya>/` papkasi.
 * `versions.json` ni qo'lda emas, `pnpm --filter docs docs:version <eski> <yangi>` bilan yangilang.
 */
export const versions: readonly string[] = data.versions;
export const latestVersion: string = data.latest;

/** Versiyaning birinchi (kirish) sahifasi */
export const versionLandingSlug = 'introduction';

export function isVersion(value: string | undefined): value is string {
  return value !== undefined && versions.includes(value);
}

export function isLatestVersion(version: string): boolean {
  return version === latestVersion;
}
