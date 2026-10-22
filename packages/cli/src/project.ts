import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { CliError } from './errors';

export interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export function readPackageJson(cwd: string): PackageJson | undefined {
  const file = path.join(cwd, 'package.json');
  if (!existsSync(file)) return undefined;
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as PackageJson;
  } catch {
    throw new CliError(`package.json o'qib bo'lmadi: ${file}`);
  }
}

export function dependencyVersion(pkg: PackageJson | undefined, name: string): string | undefined {
  return pkg?.dependencies?.[name] ?? pkg?.devDependencies?.[name] ?? pkg?.peerDependencies?.[name];
}

/** `child` `parent` ichidami (yoki o'zimi). Ikkalasi ham absolyut yo'l. */
export function isInside(parent: string, child: string): boolean {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

export type TailwindStatus = 'v4' | 'old' | 'missing' | 'unknown';

/** package.json'dagi `tailwindcss` versiyasi bo'yicha. */
export function tailwindStatus(pkg: PackageJson | undefined): TailwindStatus {
  const range = dependencyVersion(pkg, 'tailwindcss');
  if (!range) return 'missing';
  const major = /(\d+)/.exec(range.replace(/^npm:[^@]*@/, ''))?.[1];
  if (!major) return 'unknown'; // workspace:*, latest, git url ...
  return Number(major) >= 4 ? 'v4' : 'old';
}
