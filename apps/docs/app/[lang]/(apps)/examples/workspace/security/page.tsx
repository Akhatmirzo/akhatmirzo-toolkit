import type { Metadata } from 'next';
import { SecurityPage } from '@/components/examples/workspace/security/security-page';

export const metadata: Metadata = {
  title: 'Xavfsizlik — Xodimlar va sozlamalar',
  description: "Parol, ikki bosqichli autentifikatsiya, faol sessiyalar va hisobni o'chirish.",
};

export default function Page() {
  return <SecurityPage />;
}
