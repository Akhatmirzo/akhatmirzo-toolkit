import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from './args';
import { add, DEFAULT_BLOCKS_DIR } from './commands/add';
import { init } from './commands/init';
import { list } from './commands/list';
import type { Context, FetchLike } from './context';
import { DEFAULT_REGISTRY } from './context';
import { CliError } from './errors';
import type { Runner } from './pm';
import { createRunner } from './pm';
import { normalizeRegistry } from './registry';
import type { Output, Prompter } from './ui';
import { createLogger, createPrompter, shouldUseColor } from './ui';

export const VERSION = typeof __CLI_VERSION__ === 'string' ? __CLI_VERSION__ : '0.0.0-dev';

/** Testlarda almashtiriladigan tashqi bog'liqliklar. */
export interface MainDeps {
  cwd?: string;
  env?: Record<string, string | undefined>;
  stdout?: Output & { isTTY?: boolean };
  stderr?: Output;
  interactive?: boolean;
  prompter?: Prompter;
  fetch?: FetchLike;
  run?: Runner;
}

export const HELP = `akhatmirzo — @akhatmirzo/ui uchun CLI

Foydalanish:
  npx @akhatmirzo/cli <buyruq> [parametrlar]

Buyruqlar:
  init               paketlarni o'rnatadi, global CSS'ga tokenlar va @source qo'shadi
  add <blok...>      bloklarni registry'dan loyihaga ko'chiradi
  list               mavjud bloklar ro'yxati

Parametrlar:
  --cwd <papka>      loyiha papkasi (standart: joriy papka)
  -y, --yes          savollarga "ha" (mavjud fayllar baribir qayta yozilmaydi)
  -o, --overwrite    add: mavjud fayllar ustidan yozish
  --no-install       paketlarni o'rnatmaslik (faqat buyruqni ko'rsatadi)
  -d, --dir <papka>  add: bloklar papkasi (standart: ${DEFAULT_BLOCKS_DIR})
  --css <fayl>       init: global CSS fayl (standart: avtomatik topiladi)
  -r, --registry <url|papka>
                     registry manzili (standart: ${DEFAULT_REGISTRY})
  -h, --help         yordam
  -v, --version      versiya

Misollar:
  npx @akhatmirzo/cli init
  npx @akhatmirzo/cli add login pricing --dir src/components/blocks
  npx @akhatmirzo/cli list --registry ./my-registry
`;

export async function main(argv: readonly string[], deps: MainDeps = {}): Promise<number> {
  const env = deps.env ?? process.env;
  const stdout = deps.stdout ?? process.stdout;
  const stderr = deps.stderr ?? process.stderr;
  const logger = createLogger(stdout, stderr, shouldUseColor(stdout, env));

  try {
    const { command, positionals, flags } = parseArgs(argv);

    if (flags.version) {
      logger.log(VERSION);
      return 0;
    }
    if (flags.help || !command) {
      stdout.write(HELP);
      return 0;
    }

    const cwd = path.resolve(deps.cwd ?? process.cwd(), flags.cwd ?? '.');
    if (!existsSync(cwd) || !statSync(cwd).isDirectory()) {
      throw new CliError(`Papka topilmadi: ${cwd}`);
    }

    const ctx: Context = {
      cwd,
      yes: flags.yes,
      noInstall: flags.noInstall,
      interactive:
        deps.interactive ?? (Boolean(process.stdin.isTTY) && Boolean(process.stdout.isTTY)),
      registry: normalizeRegistry(
        flags.registry ?? env.AKHATMIRZO_REGISTRY ?? DEFAULT_REGISTRY,
        cwd,
      ),
      env,
      logger,
      prompter: deps.prompter ?? createPrompter(process.stdin, process.stdout),
      fetch: deps.fetch ?? (globalThis.fetch as unknown as FetchLike),
      run: deps.run ?? createRunner(),
    };

    switch (command) {
      case 'init':
        await init(ctx, { css: flags.css });
        return 0;
      case 'add':
        await add(ctx, positionals, { dir: flags.dir, overwrite: flags.overwrite });
        return 0;
      case 'list':
        await list(ctx);
        return 0;
      default:
        throw new CliError(`Noma'lum buyruq: ${command}`, 'Buyruqlar: init, add, list');
    }
  } catch (error) {
    if (error instanceof CliError) {
      logger.error(error.message);
      if (error.hint) logger.log(`  ${error.hint}`);
      return 1;
    }
    logger.error(
      `Kutilmagan xato: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`,
    );
    return 1;
  }
}
