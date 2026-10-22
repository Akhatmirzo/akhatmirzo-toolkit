import { existsSync, lstatSync, mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Context } from '../context';
import { confirm } from '../context';
import { CliError } from '../errors';
import { detectPackageManager, installCommand, isValidPackageSpec, packageName } from '../pm';
import { dependencyVersion, isInside, readPackageJson } from '../project';
import type { RegistryItem } from '../registry';
import { NotFoundError, fetchJson, isValidBlockName, parseItem, resolveInside } from '../registry';

export const DEFAULT_BLOCKS_DIR = 'components/blocks';

export interface AddOptions {
  dir?: string;
  overwrite: boolean;
}

export async function add(
  ctx: Context,
  names: readonly string[],
  options: AddOptions,
): Promise<void> {
  const { logger } = ctx;
  const unique = [...new Set(names)];
  if (unique.length === 0) {
    throw new CliError(
      'Kamida bitta blok nomini kiriting',
      'Mavjud bloklar: `npx @akhatmirzo/cli list`',
    );
  }
  for (const name of unique) {
    if (!isValidBlockName(name)) throw new CliError(`Noto'g'ri blok nomi: ${JSON.stringify(name)}`);
  }

  // Maqsad papka loyiha ichida bo'lishi shart
  const targetDir = path.resolve(ctx.cwd, options.dir ?? DEFAULT_BLOCKS_DIR);
  if (!isInside(ctx.cwd, targetDir)) {
    throw new CliError(`--dir loyiha papkasidan tashqarida: ${targetDir}`);
  }

  // 1) Hammasini oldin yuklab, tekshiramiz — xato bo'lsa hech narsa yozilmaydi
  const items: RegistryItem[] = [];
  for (const name of unique) {
    try {
      items.push(parseItem(await fetchJson(ctx, `${ctx.registry}/${name}.json`), name));
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new CliError(
          `"${name}" bloki topilmadi`,
          'Mavjud bloklar: `npx @akhatmirzo/cli list`',
        );
      }
      throw error;
    }
  }
  const planned = items.flatMap((item) =>
    item.files.map((file) => ({ item, file, target: resolveInside(targetDir, file.path) })),
  );

  // 2) Yozish
  const realRoot = realpathSync(ctx.cwd);
  let written = 0;
  let skipped = 0;
  for (const { file, target } of planned) {
    const shown = path.relative(ctx.cwd, target).split(path.sep).join('/');
    // lstat: "osilib qolgan" (dangling) symlink ham aniqlansin — existsSync uni ko'rmaydi
    const stat = lstatSync(target, { throwIfNoEntry: false });
    if (stat) {
      if (stat.isSymbolicLink()) {
        logger.warn(`${shown} — symlink, o'tkazib yuborildi`);
        skipped++;
        continue;
      }
      let replace = options.overwrite;
      if (!replace && !ctx.yes && ctx.interactive) {
        replace = await ctx.prompter.confirm(`${shown} mavjud. Ustidan yozilsinmi?`, false);
      }
      if (!replace) {
        logger.warn(`${shown} mavjud — o'tkazib yuborildi (ustidan yozish: --overwrite)`);
        skipped++;
        continue;
      }
    }
    const dir = path.dirname(target);
    // Papkalardan biri symlink orqali loyihadan tashqariga olib chiqmasin:
    // papka yaratishdan oldin (mavjud eng yaqin ajdod) va keyin tekshiriladi
    const assertInside = (p: string) => {
      if (!isInside(realRoot, realpathSync(p))) {
        throw new CliError(`Loyihadan tashqariga yozish rad etildi: ${shown}`);
      }
    };
    assertInside(nearestExisting(dir));
    mkdirSync(dir, { recursive: true });
    assertInside(dir);
    writeFileSync(target, file.content, 'utf8');
    logger.success(shown);
    written++;
  }

  logger.log();
  logger.info(`${written} ta fayl yozildi${skipped ? `, ${skipped} ta o'tkazib yuborildi` : ''}.`);

  // 3) Bloklarga kerakli paketlar
  await offerDependencies(ctx, items);
}

async function offerDependencies(ctx: Context, items: readonly RegistryItem[]): Promise<void> {
  const { logger } = ctx;
  const pkg = readPackageJson(ctx.cwd);
  const specs = [...new Set(items.flatMap((i) => i.dependencies))];
  const invalid = specs.filter((s) => !isValidPackageSpec(s));
  for (const spec of invalid)
    logger.warn(`Noto'g'ri paket nomi e'tiborsiz qoldirildi: ${JSON.stringify(spec)}`);
  const missing = specs
    .filter((s) => isValidPackageSpec(s))
    .filter((s) => !dependencyVersion(pkg, packageName(s)));
  if (missing.length === 0) return;

  const { pm } = detectPackageManager(ctx.cwd, ctx.env);
  const { command, args } = installCommand(pm, missing);
  const commandLine = `${command} ${args.join(' ')}`;
  if (!pkg) {
    logger.warn(`package.json topilmadi. Kerakli paketlarni o'zingiz o'rnating: ${commandLine}`);
    return;
  }
  logger.log();
  logger.info(`Bloklar uchun kerakli paketlar: ${missing.join(', ')}`);
  if (!ctx.noInstall && (await confirm(ctx, `${pm} bilan o'rnatilsinmi?`, true))) {
    await ctx.run(command, args, ctx.cwd);
    logger.success("Paketlar o'rnatildi");
  } else {
    logger.log(`Keyinroq o'rnatish: ${logger.bold(commandLine)}`);
  }
}

/** `p` ning o'zi yoki mavjud bo'lgan eng yaqin ota papkasi. */
function nearestExisting(p: string): string {
  let current = p;
  while (!existsSync(current)) {
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return current;
}
