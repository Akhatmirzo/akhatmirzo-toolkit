import { blocks } from '@/components/blocks/registry.generated';
import { Install } from '../install';

export interface BlockInstallProps {
  /** Blok nomi: `"login"` */
  name: string;
}

/** Blokka kerakli paketlar: `@akhatmirzo/ui` + `@akhatmirzo/tokens` + `block.json` dagi `dependencies` */
export function BlockInstall({ name }: BlockInstallProps) {
  const block = blocks[name];
  if (!block) throw new Error(`BlockInstall: "${name}" bloki topilmadi`);
  const pkg = ['@akhatmirzo/ui', '@akhatmirzo/tokens', ...block.meta.dependencies].join(' ');
  return <Install pkg={pkg} />;
}
