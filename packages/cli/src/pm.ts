import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { CliError } from './errors';

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

const LOCKFILES: ReadonlyArray<readonly [string, PackageManager]> = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['bun.lockb', 'bun'],
  ['bun.lock', 'bun'],
  ['yarn.lock', 'yarn'],
  ['package-lock.json', 'npm'],
  ['npm-shrinkwrap.json', 'npm'],
];

export interface Detection {
  pm: PackageManager;
  source: 'lockfile' | 'user-agent' | 'default';
  lockfile?: string;
}

/** `npm_config_user_agent` — masalan `pnpm/9.15.0 npm/? node/v22.0.0 win32 x64` */
export function fromUserAgent(userAgent: string | undefined): PackageManager | undefined {
  const name = userAgent?.split('/')[0]?.trim();
  return name === 'pnpm' || name === 'yarn' || name === 'bun' || name === 'npm' ? name : undefined;
}

/**
 * Paket menejerini aniqlaydi: 1) cwd'dan yuqoriga qarab birinchi lockfile (monorepo uchun);
 * 2) CLI qaysi menejer orqali chaqirilgan (`npm_config_user_agent`); 3) npm.
 */
export function detectPackageManager(
  cwd: string,
  env: Record<string, string | undefined>,
): Detection {
  let dir = path.resolve(cwd);
  for (;;) {
    for (const [file, pm] of LOCKFILES) {
      const full = path.join(dir, file);
      if (existsSync(full)) return { pm, source: 'lockfile', lockfile: full };
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const fromAgent = fromUserAgent(env.npm_config_user_agent);
  if (fromAgent) return { pm: fromAgent, source: 'user-agent' };
  return { pm: 'npm', source: 'default' };
}

export function installCommand(
  pm: PackageManager,
  packages: readonly string[],
): { command: PackageManager; args: string[] } {
  return { command: pm, args: [pm === 'npm' ? 'install' : 'add', ...packages] };
}

const NAME = '(?:@[a-z0-9][a-z0-9._~-]*\\/)?[a-z0-9][a-z0-9._~-]*';
const PACKAGE_SPEC = new RegExp(`^${NAME}(?:@[A-Za-z0-9.^~*+-]+)?$`);

/**
 * Paket nomi (ixtiyoriy versiya bilan). Registry'dan kelgan qiymatlar shu bilan tekshiriladi —
 * bo'shliq, qo'shtirnoq, `&|<>%` kabi shell belgilari o'tmaydi.
 */
export function isValidPackageSpec(spec: string): boolean {
  return spec.length <= 214 && PACKAGE_SPEC.test(spec);
}

/** `react@^19` → `react`, `@scope/pkg@1` → `@scope/pkg` */
export function packageName(spec: string): string {
  const at = spec.indexOf('@', 1);
  return at === -1 ? spec : spec.slice(0, at);
}

export type Runner = (command: string, args: readonly string[], cwd: string) => Promise<void>;

const SAFE_ARG = /^[A-Za-z0-9@./^~*+:=_-]+$/;

/**
 * Buyruqni ishga tushiradi. Unix'da `shell: false`. Windows'da `pnpm`/`npm` — `.cmd` fayllar,
 * Node ularni faqat shell orqali ishga tushiradi, shuning uchun argumentlar oldindan qat'iy
 * tekshiriladi va qo'shtirnoqqa olinadi.
 */
export function createRunner(platform: NodeJS.Platform = process.platform): Runner {
  return (command, args, cwd) =>
    new Promise<void>((resolve, reject) => {
      for (const arg of [command, ...args]) {
        if (!SAFE_ARG.test(arg)) {
          reject(new CliError(`Xavfsiz bo'lmagan argument rad etildi: ${arg}`));
          return;
        }
      }
      const child =
        platform === 'win32'
          ? spawn([command, ...args.map((a) => `"${a}"`)].join(' '), {
              cwd,
              stdio: 'inherit',
              shell: true,
              // cmd.exe joriy papkadagi `pnpm.cmd` kabi fayllarni PATH'dan oldin topmasin
              env: { ...process.env, NoDefaultCurrentDirectoryInExePath: '1' },
            })
          : spawn(command, [...args], { cwd, stdio: 'inherit', shell: false });
      child.on('error', (error) =>
        reject(new CliError(`'${command}' ishga tushmadi: ${error.message}`)),
      );
      child.on('exit', (code) => {
        if (code === 0) resolve();
        else
          reject(
            new CliError(`'${command} ${args.join(' ')}' xato bilan tugadi (kod ${code ?? '?'})`),
          );
      });
    });
}
