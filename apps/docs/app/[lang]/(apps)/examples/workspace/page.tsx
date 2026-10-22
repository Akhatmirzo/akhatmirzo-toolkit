import type { Metadata } from 'next';
import { TeamPage } from '@/components/examples/workspace/team/team-page';

export const metadata: Metadata = {
  title: 'Xodimlar — Xodimlar va sozlamalar',
  description: "Jamoa a'zolari ro'yxati: qidiruv, filtrlar, qo'shish, tahrirlash va o'chirish.",
};

export default function Page() {
  return <TeamPage />;
}
