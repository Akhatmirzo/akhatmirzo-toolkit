import { createInterface } from 'node:readline/promises';

export interface Output {
  write(chunk: string): unknown;
}

export interface Logger {
  log(message?: string): void;
  info(message: string): void;
  success(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  bold(text: string): string;
  dim(text: string): string;
  cyan(text: string): string;
}

/** Ranglar faqat terminalda va NO_COLOR o'rnatilmagan bo'lsa. */
export function shouldUseColor(
  stream: { isTTY?: boolean },
  env: Record<string, string | undefined>,
): boolean {
  return Boolean(stream.isTTY) && !env.NO_COLOR && env.TERM !== 'dumb';
}

export function createLogger(out: Output, err: Output, color: boolean): Logger {
  const paint = (code: number, reset: number) => (text: string) =>
    color ? `\u001b[${code}m${text}\u001b[${reset}m` : text;
  const green = paint(32, 39);
  const yellow = paint(33, 39);
  const red = paint(31, 39);
  const blue = paint(34, 39);
  const cyan = paint(36, 39);
  const bold = paint(1, 22);
  const dim = paint(2, 22);

  return {
    log: (message = '') => void out.write(`${message}\n`),
    info: (message) => void out.write(`${blue('i')} ${message}\n`),
    success: (message) => void out.write(`${green('✔')} ${message}\n`),
    warn: (message) => void err.write(`${yellow('!')} ${message}\n`),
    error: (message) => void err.write(`${red('✖')} ${message}\n`),
    bold,
    dim,
    cyan,
  };
}

export interface Prompter {
  confirm(question: string, defaultValue: boolean): Promise<boolean>;
  text(question: string, defaultValue?: string): Promise<string>;
}

export function createPrompter(
  input: NodeJS.ReadableStream,
  output: NodeJS.WritableStream,
): Prompter {
  async function ask(question: string): Promise<string> {
    const rl = createInterface({ input, output });
    try {
      return await rl.question(question);
    } finally {
      rl.close();
    }
  }

  return {
    async confirm(question, defaultValue) {
      const suffix = defaultValue ? '(Y/n)' : '(y/N)';
      const answer = (await ask(`? ${question} ${suffix} `)).trim().toLowerCase();
      if (answer === '') return defaultValue;
      // y/yes yoki h/ha — rozi; n/no yoki yo'q — rad
      if (['y', 'yes', 'h', 'ha'].includes(answer)) return true;
      if (['n', 'no', "yo'q", 'yoq'].includes(answer)) return false;
      return defaultValue;
    },
    async text(question, defaultValue) {
      const suffix = defaultValue ? ` (${defaultValue})` : '';
      const answer = (await ask(`? ${question}${suffix} `)).trim();
      return answer === '' ? (defaultValue ?? '') : answer;
    },
  };
}
