import type { Context } from '../context';
import { CliError } from '../errors';
import { NotFoundError, fetchJson, parseIndex } from '../registry';

export async function list(ctx: Context): Promise<void> {
  let data: unknown;
  try {
    data = await fetchJson(ctx, `${ctx.registry}/index.json`);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new CliError(error.message, 'Registry manzilini tekshiring: `--registry <url|papka>`');
    }
    throw error;
  }
  const items = parseIndex(data);
  const { logger } = ctx;

  if (items.length === 0) {
    logger.warn("Registry'da hozircha bloklar yo'q.");
    return;
  }

  const groups = new Map<string, typeof items>();
  for (const item of [...items].sort((a, b) => a.name.localeCompare(b.name))) {
    const key = item.category ?? 'boshqa';
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  const width = Math.max(...items.map((i) => i.name.length));

  logger.log(logger.bold(`Mavjud bloklar (${items.length}):`));
  for (const [category, group] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
    logger.log();
    logger.log(logger.dim(category));
    for (const item of group) {
      const text = item.description ? `${item.title} — ${item.description}` : item.title;
      logger.log(`  ${logger.cyan(item.name.padEnd(width))}  ${text}`);
    }
  }
  logger.log();
  logger.log(`Qo'shish: ${logger.bold('npx @akhatmirzo/cli add <nom...>')}`);
}
