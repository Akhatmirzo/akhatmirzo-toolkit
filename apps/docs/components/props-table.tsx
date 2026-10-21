import type { ReactNode } from 'react';
import { getDictionary } from '@/lib/dictionary';
import type { Lang } from '@/lib/i18n';

export interface PropRow {
  /** Prop nomi: `variant` */
  name: string;
  /** Tip, TypeScript ko'rinishida: `"'sm' | 'md' | 'lg'"` */
  type: string;
  /** Standart qiymat, kod ko'rinishida: `"'md'"`. Yo'q bo'lsa — tushirib qoldiring */
  default?: string;
  /** Majburiy prop */
  required?: boolean;
  /** Qisqa tavsif (matn yoki JSX) */
  description?: ReactNode;
}

export interface PropsTableProps {
  rows: PropRow[];
  lang: Lang;
}

/** Props jadvali: Prop · Tip · Standart · Tavsif (sarlavhalar sahifa tilida) */
export function PropsTable({ rows, lang }: PropsTableProps) {
  const t = getDictionary(lang).props;

  return (
    <div className="not-prose my-6 overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="bg-surface-muted text-text-muted">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-medium">
              {t.prop}
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              {t.type}
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              {t.default}
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              {t.description}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t border-border align-top">
              <td className="px-4 py-3 whitespace-nowrap">
                <code className="font-mono font-semibold text-primary-soft-foreground">
                  {row.name}
                </code>
                {row.required && (
                  <span className="ml-1.5 text-xs text-danger-soft-foreground">{t.required}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <code className="font-mono text-xs break-words text-text-subtle">{row.type}</code>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {row.default ? (
                  <code className="font-mono text-xs text-text">{row.default}</code>
                ) : (
                  <span className="text-text-faint">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-text-muted">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
