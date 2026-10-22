import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createRunner,
  detectPackageManager,
  fromUserAgent,
  installCommand,
  isValidPackageSpec,
  packageName,
} from './pm';

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'akh-pm-'));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe('detectPackageManager', () => {
  it.each([
    ['pnpm-lock.yaml', 'pnpm'],
    ['package-lock.json', 'npm'],
    ['yarn.lock', 'yarn'],
    ['bun.lockb', 'bun'],
    ['bun.lock', 'bun'],
  ])('%s → %s', (lockfile, pm) => {
    writeFileSync(path.join(dir, lockfile), '');
    expect(detectPackageManager(dir, {})).toMatchObject({ pm, source: 'lockfile' });
  });

  it('lockfile yuqori papkada (monorepo)', () => {
    writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');
    const app = path.join(dir, 'apps', 'web');
    mkdirSync(app, { recursive: true });
    expect(detectPackageManager(app, {}).pm).toBe('pnpm');
  });

  it("lockfile bo'lmasa — user agent, keyin npm", () => {
    // tmpdir ichida yuqorida lockfile bo'lmasligi kerak — odatda shunday
    const env = { npm_config_user_agent: 'yarn/4.1.0 npm/? node/v22.0.0 linux x64' };
    const withAgent = detectPackageManager(dir, env);
    const plain = detectPackageManager(dir, {});
    if (withAgent.source !== 'lockfile') {
      expect(withAgent).toEqual({ pm: 'yarn', source: 'user-agent' });
      expect(plain).toEqual({ pm: 'npm', source: 'default' });
    }
  });

  it('fromUserAgent', () => {
    expect(fromUserAgent('pnpm/9.15.0 npm/? node/v22')).toBe('pnpm');
    expect(fromUserAgent('bun/1.2.0')).toBe('bun');
    expect(fromUserAgent('deno/2')).toBeUndefined();
    expect(fromUserAgent(undefined)).toBeUndefined();
  });
});

describe('installCommand', () => {
  it('npm install, qolganlari add', () => {
    expect(installCommand('npm', ['a'])).toEqual({ command: 'npm', args: ['install', 'a'] });
    expect(installCommand('pnpm', ['a', 'b'])).toEqual({
      command: 'pnpm',
      args: ['add', 'a', 'b'],
    });
    expect(installCommand('bun', ['a']).args[0]).toBe('add');
  });
});

describe('isValidPackageSpec', () => {
  it("to'g'ri nomlar", () => {
    for (const s of [
      'zod',
      'react-hook-form',
      '@hookform/resolvers',
      'recharts@^3.1.0',
      '@a/b@1.2.3',
    ]) {
      expect(isValidPackageSpec(s), s).toBe(true);
    }
  });
  it("shell belgilari va g'alati nomlar rad etiladi", () => {
    for (const s of [
      'zod && rm -rf /',
      'a;b',
      'a|b',
      '"x"',
      'Upper',
      '../x',
      '-g',
      'a b',
      'x@1 || y',
      '%PATH%',
      '',
    ]) {
      expect(isValidPackageSpec(s), s).toBe(false);
    }
  });
  it('packageName versiyani olib tashlaydi', () => {
    expect(packageName('react@^19')).toBe('react');
    expect(packageName('@scope/pkg@1')).toBe('@scope/pkg');
    expect(packageName('@scope/pkg')).toBe('@scope/pkg');
  });
});

describe('createRunner', () => {
  it('xavfli argumentni ishga tushirmasdan rad etadi', async () => {
    await expect(createRunner('linux')('npm', ['install', 'a;b'], dir)).rejects.toThrow(
      /rad etildi/,
    );
    await expect(createRunner('win32')('npm', ['install', 'a&calc'], dir)).rejects.toThrow(
      /rad etildi/,
    );
  });

  // cmd.exe metabelgilari: qo'shtirnoqdan chiqish, o'zgaruvchi kengaytirish, yo'naltirish
  it.each(['a&b', 'a|b', 'a<b', 'a>b', 'a%PATH%', 'a!x!', 'a"b', 'a(b)', 'a\nb', 'a b', 'a`b'])(
    'win32: %j rad etiladi',
    async (arg) => {
      await expect(createRunner('win32')('npm', ['install', arg], dir)).rejects.toThrow(
        /rad etildi/,
      );
    },
  );

  it('haqiqiy jarayonni ishga tushiradi (Windows: shell orqali), kodga qarab natija', async () => {
    const runner = createRunner();
    await expect(runner('node', ['--version'], dir)).resolves.toBeUndefined();
    writeFileSync(path.join(dir, 'exit3.js'), 'process.exit(3);');
    await expect(runner('node', ['exit3.js'], dir)).rejects.toThrow(/kod 3/);
  });
});
