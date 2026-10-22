import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Context } from '../context';
import { confirm } from '../context';
import { findCssFile, patchCss, sourcePathFor } from '../css';
import { CliError } from '../errors';
import { detectPackageManager, installCommand } from '../pm';
import { dependencyVersion, isInside, readPackageJson, tailwindStatus } from '../project';

export const CORE_PACKAGES = ['@akhatmirzo/ui', '@akhatmirzo/tokens'] as const;

export interface InitOptions {
  css?: string;
}

export async function init(ctx: Context, options: InitOptions): Promise<void> {
  const { logger } = ctx;
  const pkg = readPackageJson(ctx.cwd);
  if (!pkg) {
    throw new CliError(
      `package.json topilmadi: ${ctx.cwd}`,
      'Loyiha papkasida ishga tushiring yoki `--cwd <papka>` bering',
    );
  }
  if (!ctx.yes && !ctx.interactive) {
    throw new CliError("Interaktiv bo'lmagan muhit: `--yes` bilan ishga tushiring");
  }

  // 1) Tailwind v4
  const tw = tailwindStatus(pkg);
  if (tw === 'missing') {
    logger.warn(
      "tailwindcss package.json'da topilmadi. Komponentlar Tailwind CSS v4 talab qiladi.",
    );
  } else if (tw === 'old') {
    logger.warn(
      `tailwindcss ${dependencyVersion(pkg, 'tailwindcss')} — komponentlar Tailwind CSS v4 talab qiladi.`,
    );
  }

  // 2) Paketlar
  const detection = detectPackageManager(ctx.cwd, ctx.env);
  const missing = CORE_PACKAGES.filter((name) => !dependencyVersion(pkg, name));
  if (missing.length === 0) {
    logger.success(`${CORE_PACKAGES.join(' va ')} allaqachon o'rnatilgan`);
  } else {
    const { command, args } = installCommand(detection.pm, missing);
    const via = detection.lockfile ? path.basename(detection.lockfile) : detection.source;
    logger.info(`Paket menejeri: ${logger.bold(detection.pm)} ${logger.dim(`(${via})`)}`);
    if (!ctx.noInstall && (await confirm(ctx, `${missing.join(' ')} o'rnatilsinmi?`, true))) {
      await ctx.run(command, args, ctx.cwd);
      logger.success(`${missing.join(', ')} o'rnatildi`);
    } else {
      logger.log(`Keyinroq o'rnatish: ${logger.bold(`${command} ${args.join(' ')}`)}`);
    }
  }

  // 3) Global CSS
  const cssFile = await resolveCssFile(ctx, options.css);
  const shown = path.relative(ctx.cwd, cssFile).split(path.sep).join('/');
  const original = readFileSync(cssFile, 'utf8');
  const result = patchCss(original, sourcePathFor(cssFile, ctx.cwd));
  if (!result.hasTailwindImport) {
    logger.warn(`${shown} ichida \`@import 'tailwindcss';\` topilmadi — uni o'zingiz qo'shing.`);
  }
  if (result.changed) {
    writeFileSync(cssFile, result.content, 'utf8');
    if (result.addedImport) logger.success(`${shown}: tokenlar importi qo'shildi`);
    if (result.addedSource) logger.success(`${shown}: @source qatori qo'shildi`);
  } else {
    logger.success(`${shown} allaqachon sozlangan`);
  }

  logger.log();
  logger.log(logger.bold('Tayyor!') + ' Keyingi qadamlar:');
  logger.log(
    "  1. Ilova ildiziga provayderlarni qo'ying: TooltipProvider, ConfirmProvider, <Toaster />",
  );
  logger.log(`  2. Bloklar: ${logger.cyan('npx @akhatmirzo/cli list')}`);
  logger.log(`  Hujjatlar: ${logger.cyan('https://toolkit.akhatmirzo.uz')}`);
}

async function resolveCssFile(ctx: Context, explicit: string | undefined): Promise<string> {
  let candidate = explicit ? path.resolve(ctx.cwd, explicit) : findCssFile(ctx.cwd);
  if (!candidate) {
    if (!ctx.interactive) {
      throw new CliError('Global CSS fayl topilmadi', "Yo'lini `--css <fayl>` bilan bering");
    }
    const answer = await ctx.prompter.text(
      "Global CSS fayl yo'li (Tailwind import qilingan):",
      'src/index.css',
    );
    candidate = path.resolve(ctx.cwd, answer);
  }
  if (!isInside(ctx.cwd, candidate)) {
    throw new CliError(`CSS fayl loyiha papkasidan tashqarida: ${candidate}`);
  }
  if (!existsSync(candidate)) {
    throw new CliError(`CSS fayl topilmadi: ${candidate}`, "Yo'lini `--css <fayl>` bilan bering");
  }
  return candidate;
}
