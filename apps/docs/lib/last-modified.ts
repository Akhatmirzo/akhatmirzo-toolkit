import { execFileSync } from 'node:child_process';

/**
 * Fayllarning oxirgi o'zgargan sanasi — git tarixidan (sitemap `lastmod`, JSON-LD `dateModified`).
 * Build vaqtida bir marta `git log` chaqiriladi. Git bo'lmasa — `undefined` (sana yozilmaydi).
 *
 * Sayoz (shallow) klonda chegaradagi commit butun daraxtni "qo'shgan" bo'lib ko'rinadi — uning
 * sanasi noto'g'ri, shuning uchun bunday fayllarga sana bermaymiz. Vercel'da to'liq tarix uchun
 * `VERCEL_DEEP_CLONE=true` muhit o'zgaruvchisini qo'shing.
 *
 * Yo'llar fayl tizimida emas, git ichida (repo ildiziga nisbatan) solishtiriladi — bundler butun
 * loyihani trace qilmasin.
 */

interface GitDates {
  /** Docs ilovasining repo ildiziga nisbatan prefiksi, masalan `apps/docs/` */
  prefix: string;
  /** Repo ildiziga nisbatan fayl yo'li → oxirgi o'zgarish (ms) */
  files: Map<string, number>;
}

let cache: GitDates | null = null;

function git(args: string[]) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}

function load(): GitDates {
  if (cache) return cache;
  cache = { prefix: '', files: new Map() };
  try {
    cache.prefix = git(['rev-parse', '--show-prefix']).trim();
    // Sayoz klonda chegaradagi commit'lar ota-onasiz ko'rinadi
    const shallow = git(['rev-parse', '--is-shallow-repository']).trim() === 'true';
    const out = git(['log', '--format=@@%ct %P', '--name-only', '--', '.']);
    let date = 0;
    let boundary = false;
    for (const line of out.split('\n')) {
      if (line.startsWith('@@')) {
        const [t = '0', parent] = line.slice(2).split(' ');
        date = Number(t) * 1000;
        boundary = shallow && !parent;
      } else if (line && !boundary && !cache.files.has(line)) {
        // Birinchi uchragani — eng yangisi (`git log` yangidan eskiga)
        cache.files.set(line, date);
      }
    }
  } catch {
    // git yo'q yoki repo emas — sanalarsiz davom etamiz
  }
  return cache;
}

/**
 * Berilgan fayl yoki papkalar (docs ilovasiga nisbatan, `/` bilan) ichidagi eng so'nggi o'zgarish
 * sanasi (ISO).
 */
export function lastModified(...paths: string[]): string | undefined {
  const { prefix, files } = load();
  let latest = 0;
  for (const p of paths) {
    const target = prefix + p.replaceAll('\\', '/').replace(/\/+$/, '');
    for (const [file, date] of files) {
      if ((file === target || file.startsWith(`${target}/`)) && date > latest) latest = date;
    }
  }
  return latest ? new Date(latest).toISOString() : undefined;
}

/** Docs sahifasi fayli (`page.path` — `content/docs` ga nisbatan) */
export function docsLastModified(pagePath: string) {
  return lastModified(`content/docs/${pagePath}`);
}
