import { describe, expect, it } from 'vitest';
import { parseArgs } from './args';
import { CliError } from './errors';

describe('parseArgs', () => {
  it('buyruq va pozitsion argumentlar', () => {
    const r = parseArgs(['add', 'login', 'pricing']);
    expect(r.command).toBe('add');
    expect(r.positionals).toEqual(['login', 'pricing']);
    expect(r.flags).toMatchObject({ help: false, yes: false, overwrite: false });
  });

  it('uzun va qisqa boolean bayroqlar', () => {
    expect(parseArgs(['--yes', '--overwrite']).flags).toMatchObject({ yes: true, overwrite: true });
    expect(parseArgs(['-yo']).flags).toMatchObject({ yes: true, overwrite: true });
    expect(parseArgs(['--no-install']).flags).toMatchObject({ noInstall: true });
    expect(parseArgs(['-h']).flags.help).toBe(true);
    expect(parseArgs(['--version']).flags.version).toBe(true);
  });

  it("qiymatli parametrlar: bo'shliq, = va qisqa shakl", () => {
    const r = parseArgs([
      'add',
      'x',
      '--dir',
      'src/blocks',
      '--registry=http://localhost:1/r',
      '--cwd',
      'app',
    ]);
    expect(r.flags).toMatchObject({
      dir: 'src/blocks',
      registry: 'http://localhost:1/r',
      cwd: 'app',
    });
    expect(parseArgs(['-d', 'a/b']).flags.dir).toBe('a/b');
    expect(parseArgs(['-dsrc']).flags.dir).toBe('src');
    expect(parseArgs(['-yd', 'blocks']).flags).toMatchObject({ yes: true, dir: 'blocks' });
  });

  it('-- dan keyingi hammasi pozitsion', () => {
    expect(parseArgs(['add', '--', '--yes']).positionals).toEqual(['--yes']);
  });

  it('xatolar', () => {
    expect(() => parseArgs(['--nope'])).toThrow(CliError);
    expect(() => parseArgs(['-z'])).toThrow(/Noma'lum/);
    expect(() => parseArgs(['--dir'])).toThrow(/qiymat kerak/);
    expect(() => parseArgs(['--dir', '--yes'])).toThrow(/qiymat kerak/);
    expect(() => parseArgs(['--yes=1'])).toThrow(/qiymat qabul qilmaydi/);
    // bitta harfli nom uzun shaklda qabul qilinmaydi
    expect(() => parseArgs(['--y'])).toThrow(CliError);
  });
});
