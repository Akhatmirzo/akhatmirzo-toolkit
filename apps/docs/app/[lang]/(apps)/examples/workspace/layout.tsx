import type { ReactNode } from 'react';
import { ExampleBar } from '@/components/examples/shared/example-bar';
import { WorkspaceShell } from '@/components/examples/workspace/shell';

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ExampleBar slug="workspace" />
      <WorkspaceShell>{children}</WorkspaceShell>
    </>
  );
}
