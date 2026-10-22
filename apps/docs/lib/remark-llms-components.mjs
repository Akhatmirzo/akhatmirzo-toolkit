/**
 * Markdown ko'rinishi (`/<til>/docs/....md`, `llms-full.txt`) uchun MDX komponentlarini
 * oddiy Markdown'ga aylantiradi. Sahifaning o'zi (HTML) o'zgarmaydi:
 *
 * - `<ComponentPreview name="button/loading" />` → demo faylining manba kodi (```tsx bloki);
 * - `<PropsTable rows={[...]} />` → Markdown jadval (sarlavhalar sahifa tilida);
 * - `<BlockPreview name="login" />` → blok fayli kodi + CLI buyrug'i; `<BlockInstall name="login" />` →
 *   o'rnatish buyrug'i; `<BlockGallery />` → bloklar ro'yxati (havolalar bilan).
 *
 * `replaceSource()` faqat Markdown chiqishiga ta'sir qiladi: qidiruv indeksi (remark-structure)
 * JSX elementlarni baribir o'zi almashtiradi. Qiymatni aniqlab bo'lmasa, element o'zgarishsiz qoladi.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { cwd } from 'node:process';
import { markdownTable, replaceSource } from 'fumadocs-core/mdx-plugins/stringifier';

/** Next build va dev `apps/docs` ichida ishga tushadi */
const demosDir = path.join(cwd(), 'components', 'demos');
const blocksDir = path.join(cwd(), 'blocks');

const headers = {
  uz: {
    prop: 'Prop',
    type: 'Tip',
    default: 'Standart',
    description: 'Tavsif',
    required: 'majburiy',
  },
  en: {
    prop: 'Prop',
    type: 'Type',
    default: 'Default',
    description: 'Description',
    required: 'required',
  },
};

function getAttribute(node, name) {
  return node.attributes?.find((attr) => attr.type === 'mdxJsxAttribute' && attr.name === name);
}

function readDemo(name) {
  if (typeof name !== 'string' || !/^[\w-]+(?:\/[\w-]+)*$/.test(name)) return undefined;
  try {
    return readFileSync(path.join(demosDir, `${name}.tsx`), 'utf8')
      .replace(/\r\n/g, '\n')
      .trimEnd();
  } catch {
    return undefined;
  }
}

const isSafeName = (name) => typeof name === 'string' && /^[\w-]+$/.test(name);

function readBlock(name) {
  if (!isSafeName(name)) return undefined;
  try {
    return readFileSync(path.join(blocksDir, name, `${name}.tsx`), 'utf8')
      .replace(/\r\n/g, '\n')
      .trimEnd();
  } catch {
    return undefined;
  }
}

function readBlockMeta(name) {
  if (!isSafeName(name)) return undefined;
  try {
    return JSON.parse(readFileSync(path.join(blocksDir, name, 'block.json'), 'utf8'));
  } catch {
    return undefined;
  }
}

/** JSX (`<code>`, `<a>`, matn) → inline Markdown */
function jsxToMarkdown(node) {
  if (node.type === 'JSXText') return node.value.replace(/\s+/g, ' ');
  if (node.type === 'JSXExpressionContainer') {
    const value = evaluate(node.expression);
    return typeof value === 'string' ? value : '';
  }
  if (node.type !== 'JSXElement' && node.type !== 'JSXFragment') return '';

  const inner = node.children.map(jsxToMarkdown).join('');
  const tag = node.type === 'JSXElement' ? node.openingElement.name.name : undefined;
  if (tag === 'code') return `\`${inner}\``;
  if (tag === 'strong' || tag === 'b') return `**${inner}**`;
  if (tag === 'em' || tag === 'i') return `*${inner}*`;
  if (tag === 'a') {
    const href = node.openingElement.attributes.find((attr) => attr.name?.name === 'href');
    const url = href?.value?.type === 'Literal' ? href.value.value : undefined;
    return url ? `[${inner}](${url})` : inner;
  }
  return inner;
}

/** Faqat statik qiymatlar: matn, son, boolean, shablonsiz template, JSX, massiv va obyekt */
function evaluate(node) {
  if (!node) return undefined;
  switch (node.type) {
    case 'Literal':
      return node.value;
    case 'TemplateLiteral':
      return node.expressions.length === 0 ? node.quasis[0]?.value.cooked : undefined;
    case 'JSXElement':
    case 'JSXFragment':
      return jsxToMarkdown(node).trim();
    case 'ArrayExpression': {
      const items = node.elements.map(evaluate);
      return items.includes(undefined) ? undefined : items;
    }
    case 'ObjectExpression': {
      const out = {};
      for (const prop of node.properties) {
        if (prop.type !== 'Property' || prop.computed) return undefined;
        const key = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value;
        const value = evaluate(prop.value);
        if (value === undefined) return undefined;
        out[key] = value;
      }
      return out;
    }
    default:
      return undefined;
  }
}

function getRows(node) {
  const attr = getAttribute(node, 'rows');
  const program = attr?.value?.data?.estree;
  const statement = program?.body?.[0];
  if (statement?.type !== 'ExpressionStatement') return undefined;
  const rows = evaluate(statement.expression);
  return Array.isArray(rows) ? rows : undefined;
}

/** Jadval katagi: `|` va qator ko'chishi Markdown jadvalini buzmasin */
function cell(value) {
  return String(value)
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\|/g, '\\|');
}

function code(value) {
  return `\`${cell(value)}\``;
}

export function remarkLlmsComponents() {
  return (tree, file) => {
    const lang = /\.en\.mdx?$/.test(file.path ?? '') ? 'en' : 'uz';
    const t = headers[lang];

    const visit = (node) => {
      if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
        if (node.name === 'ComponentPreview') {
          const name = getAttribute(node, 'name')?.value;
          const source = readDemo(name);
          if (source) {
            const title = `${name.split('/').pop()}.tsx`;
            replaceSource(file, node, `\`\`\`tsx title="${title}"\n${source}\n\`\`\``);
          }
          return;
        }
        if (node.name === 'BlockPreview') {
          const name = getAttribute(node, 'name')?.value;
          const source = readBlock(name);
          if (source) {
            replaceSource(
              file,
              node,
              `\`\`\`bash\nnpx @akhatmirzo/cli add ${name}\n\`\`\`\n\n\`\`\`tsx title="${name}.tsx"\n${source}\n\`\`\``,
            );
          }
          return;
        }
        if (node.name === 'BlockInstall') {
          const meta = readBlockMeta(getAttribute(node, 'name')?.value);
          if (meta) {
            const pkg = ['@akhatmirzo/ui', '@akhatmirzo/tokens', ...meta.dependencies].join(' ');
            replaceSource(file, node, `\`\`\`bash\nnpm install ${pkg}\n\`\`\``);
          }
          return;
        }
        if (node.name === 'BlockGallery') {
          let names = [];
          try {
            names = readdirSync(blocksDir, { withFileTypes: true })
              .filter((entry) => entry.isDirectory())
              .map((entry) => entry.name);
          } catch {
            // bloklar papkasi yo'q
          }
          const lines = names.flatMap((name) => {
            const meta = readBlockMeta(name);
            return meta
              ? [`- [${meta.title[lang]}](./blocks/${name}) — ${meta.description[lang]}`]
              : [];
          });
          if (lines.length > 0) replaceSource(file, node, lines.join('\n'));
          return;
        }
        if (node.name === 'PropsTable') {
          const rows = getRows(node);
          if (rows) {
            replaceSource(
              file,
              node,
              markdownTable([
                [t.prop, t.type, t.default, t.description],
                ...rows.map((row) => [
                  code(row.name) + (row.required ? ` (${t.required})` : ''),
                  code(row.type),
                  row.default === undefined ? '—' : code(row.default),
                  row.description === undefined ? '' : cell(row.description),
                ]),
              ]),
            );
          }
          return;
        }
      }
      if (Array.isArray(node.children)) node.children.forEach(visit);
    };

    visit(tree);
  };
}
