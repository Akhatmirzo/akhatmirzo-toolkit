import type { Metadata } from 'next';
import { BillingPage } from '@/components/examples/workspace/billing/billing-page';

export const metadata: Metadata = {
  title: "Tarif va to'lov — Xodimlar va sozlamalar",
  description: "Joriy tarif, foydalanish ko'rsatkichlari, tariflar va hisob-fakturalar.",
};

export default function Page() {
  return <BillingPage />;
}
