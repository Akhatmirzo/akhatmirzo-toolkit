import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/** Global CSS fayl odatda shu joylardan birida bo'ladi (Next.js, Vite, CRA ...). */
export const CSS_CANDIDATES = [
  'app/globals.css',
  'src/app/globals.css',
  'src/index.css',
  'src/styles/globals.css',
  'styles/globals.css',
  'app/global.css',
  'src/app.css',
  'src/styles.css',
  'src/main.css',
  'src/global.css',
] as const;

export const TOKENS_IMPORT = "@import '@akhatmirzo/tokens/theme.css';";

const TAILWIND_IMPORT = /^\s*@import\s+(?:url\(\s*)?['"]tailwindcss['"]/;
const TOKENS_IMPORT_RE = /@import\s+(?:url\(\s*)?['"]@akhatmirzo\/tokens\/theme\.css['"]/;
const UI_SOURCE_RE = /@source\s+['"][^'"]*@akhatmirzo\/ui[^'"]*['"]/;
const ANY_IMPORT = /^\s*@import\b/;
const CHARSET = /^\s*@charset\b/;

/** Mavjud nomzodlardan Tailwind import qilinganini afzal ko'radi. Topilmasa — undefined. */
export function findCssFile(cwd: string): string | undefined {
  const existing = CSS_CANDIDATES.map((rel) => path.join(cwd, rel)).filter((file) =>
    existsSync(file),
  );
  return (
    existing.find((file) =>
      readFileSync(file, 'utf8')
        .split(/\r?\n/)
        .some((l) => TAILWIND_IMPORT.test(l)),
    ) ?? existing[0]
  );
}

/** CSS fayldan `<cwd>/node_modules/@akhatmirzo/ui/dist` gacha nisbiy yo'l (har doim `/`). */
export function sourcePathFor(cssFile: string, cwd: string): string {
  const target = path.join(cwd, 'node_modules', '@akhatmirzo', 'ui', 'dist');
  const rel = path.relative(path.dirname(cssFile), target).split(path.sep).join('/');
  return rel.startsWith('.') ? rel : `./${rel}`;
}

export interface PatchResult {
  content: string;
  changed: boolean;
  addedImport: boolean;
  addedSource: boolean;
  hasTailwindImport: boolean;
}

/**
 * CSS'ga tokenlar importi (Tailwind importidan keyin) va `@source` qatorini (oxirgi `@import`
 * dan keyin) qo'shadi. Idempotent: qatorlar allaqachon bo'lsa — hech narsa o'zgarmaydi.
 * Qator oxiri (LF/CRLF) saqlanadi.
 */
export function patchCss(content: string, sourcePath: string): PatchResult {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);
  const twIndex = lines.findIndex((l) => TAILWIND_IMPORT.test(l));
  const hasTailwindImport = twIndex !== -1;
  const top = CHARSET.test(lines[0] ?? '') ? 1 : 0;

  const addedImport = !TOKENS_IMPORT_RE.test(content);
  if (addedImport) {
    lines.splice(hasTailwindImport ? twIndex + 1 : top, 0, TOKENS_IMPORT);
  }

  const addedSource = !UI_SOURCE_RE.test(content);
  if (addedSource) {
    let lastImport = -1;
    lines.forEach((l, i) => {
      if (ANY_IMPORT.test(l)) lastImport = i;
    });
    lines.splice(lastImport === -1 ? top : lastImport + 1, 0, `@source '${sourcePath}';`);
  }

  return {
    content: lines.join(eol),
    changed: addedImport || addedSource,
    addedImport,
    addedSource,
    hasTailwindImport,
  };
}
