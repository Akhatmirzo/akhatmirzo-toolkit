import { CliError } from './errors';

export interface Flags {
  help: boolean;
  version: boolean;
  yes: boolean;
  overwrite: boolean;
  /** `--no-install`: paketlarni o'rnatmaslik, faqat buyruqni ko'rsatish. */
  noInstall: boolean;
  cwd?: string;
  registry?: string;
  dir?: string;
  css?: string;
}

export interface ParsedArgs {
  command: string | undefined;
  positionals: string[];
  flags: Flags;
}

type BooleanFlag = 'help' | 'version' | 'yes' | 'overwrite' | 'noInstall';
type StringFlag = 'cwd' | 'registry' | 'dir' | 'css';

const BOOLEAN_FLAGS: Record<string, BooleanFlag> = {
  help: 'help',
  h: 'help',
  version: 'version',
  v: 'version',
  yes: 'yes',
  y: 'yes',
  overwrite: 'overwrite',
  o: 'overwrite',
  'no-install': 'noInstall',
};

const STRING_FLAGS: Record<string, StringFlag> = {
  cwd: 'cwd',
  registry: 'registry',
  r: 'registry',
  dir: 'dir',
  d: 'dir',
  css: 'css',
};

const HELP_HINT = "`akhatmirzo --help` bilan ro'yxatni ko'ring";

/**
 * Qo'lda yozilgan argument tahlilchisi (bog'liqliksiz).
 * Qo'llab-quvvatlanadi: `--flag`, `--key value`, `--key=value`, `-y`, `-yo`, `-d value`, `--`.
 */
export function parseArgs(argv: readonly string[]): ParsedArgs {
  const flags: Flags = {
    help: false,
    version: false,
    yes: false,
    overwrite: false,
    noInstall: false,
  };
  const positionals: string[] = [];

  const setString = (key: StringFlag, value: string | undefined, token: string) => {
    if (value === undefined || value === '' || (value.startsWith('-') && value.length > 1)) {
      throw new CliError(`${token} parametriga qiymat kerak`);
    }
    flags[key] = value;
  };

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]!;

    if (token === '--') {
      positionals.push(...argv.slice(i + 1));
      break;
    }

    if (token.startsWith('--')) {
      const eq = token.indexOf('=');
      const name = eq === -1 ? token.slice(2) : token.slice(2, eq);
      const inline = eq === -1 ? undefined : token.slice(eq + 1);
      const bool = name.length > 1 ? BOOLEAN_FLAGS[name] : undefined;
      const str = name.length > 1 ? STRING_FLAGS[name] : undefined;
      if (bool) {
        if (inline !== undefined) throw new CliError(`--${name} qiymat qabul qilmaydi`);
        flags[bool] = true;
      } else if (str) {
        if (inline !== undefined) setString(str, inline, `--${name}`);
        else setString(str, argv[++i], `--${name}`);
      } else {
        throw new CliError(`Noma'lum parametr: ${token}`, HELP_HINT);
      }
      continue;
    }

    if (token.startsWith('-') && token.length > 1) {
      const letters = token.slice(1);
      for (let j = 0; j < letters.length; j++) {
        const letter = letters[j]!;
        const bool = BOOLEAN_FLAGS[letter];
        const str = STRING_FLAGS[letter];
        if (bool) {
          flags[bool] = true;
        } else if (str) {
          // `-d value` yoki `-dvalue`
          const rest = letters.slice(j + 1);
          if (rest) setString(str, rest, `-${letter}`);
          else setString(str, argv[++i], `-${letter}`);
          break;
        } else {
          throw new CliError(`Noma'lum parametr: -${letter}`, HELP_HINT);
        }
      }
      continue;
    }

    positionals.push(token);
  }

  const [command, ...rest] = positionals;
  return { command, positionals: rest, flags };
}
