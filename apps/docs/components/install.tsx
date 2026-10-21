import {
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
} from 'fumadocs-ui/components/codeblock';
import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';

const managers = [
  { id: 'pnpm', add: 'pnpm add', dev: '-D' },
  { id: 'npm', add: 'npm install', dev: '-D' },
  { id: 'yarn', add: 'yarn add', dev: '-D' },
  { id: 'bun', add: 'bun add', dev: '-d' },
] as const;

export interface InstallProps {
  /** Bitta yoki bir nechta paket, bo'sh joy bilan: `"@akhatmirzo/ui @akhatmirzo/tokens"` */
  pkg: string;
  /** devDependencies ga */
  dev?: boolean;
}

/** pnpm / npm / yarn / bun tablari; tanlangan menejer barcha sahifalarda eslab qolinadi */
export function Install({ pkg, dev = false }: InstallProps) {
  return (
    <CodeBlockTabs defaultValue="pnpm" groupId="package-manager" persist>
      <CodeBlockTabsList>
        {managers.map((m) => (
          <CodeBlockTabsTrigger key={m.id} value={m.id}>
            {m.id}
          </CodeBlockTabsTrigger>
        ))}
      </CodeBlockTabsList>
      {managers.map((m) => (
        <CodeBlockTab key={m.id} value={m.id}>
          <ServerCodeBlock code={`${m.add}${dev ? ` ${m.dev}` : ''} ${pkg}`} lang="bash" />
        </CodeBlockTab>
      ))}
    </CodeBlockTabs>
  );
}
