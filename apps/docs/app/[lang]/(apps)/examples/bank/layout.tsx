import type { ReactNode } from 'react';
import { BankProvider } from '@/components/examples/bank/bank-store';
import { BankShell } from '@/components/examples/bank/bank-shell';
import { ExampleBar } from '@/components/examples/shared/example-bar';

/** Bank ilovasi: umumiy holat (BankProvider) va qobiq barcha ichki sahifalar uchun bitta */
export default function BankLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ExampleBar slug="bank" />
      <BankProvider>
        <BankShell>{children}</BankShell>
      </BankProvider>
    </>
  );
}
